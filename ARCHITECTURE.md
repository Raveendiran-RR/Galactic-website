# Architecture

## Overview

```
index.html
└─ src/main.tsx ── App.tsx
     ├─ mode === 'quick' (or no WebGL) → <QuickProfile/>           ← DOM only, tiny bundle
     └─ mode === 'cinematic'           → lazy(<CinematicExperience/>) ← three.js lives here
           ├─ <Canvas>  (single WebGL context for every phase)
           │    ├─ <PerspectiveCamera makeDefault>   ← <Cockpit/> is parented to the camera
           │    ├─ <CameraRig/>                       GSAP-driven pose + parallax + shake + FOV
           │    ├─ phase 'intro'      → IntroScene        (tunnel starfield + faint nebula)
           │    ├─ phase 'hyperspace' → HyperspaceScene   (instanced streaks)
           │    ├─ phase 'galaxy'     → GalaxyScene       (6 planets, station, planet, nebula, dust)
           │    └─ <Effects/>  Bloom + Vignette + ChromaticAberration (disabled on low tier)
           └─ DOM overlays: IntroOverlay · WarpFlash · Hud · PlanetPanel · Terminal · AssistantChat
```

## Phases and the director

`phase: 'intro' → 'hyperspace' → 'galaxy'` lives in the Zustand store (`src/stores/useApp.ts`).
`src/utils/director.ts` owns the hyperspace timeline (GSAP). It animates **`fx`** (`src/stores/fx.ts`), a *plain mutable object* (speed, shake, fovBoost, flash, reveal, stars…) that scenes read inside `useFrame`. Animating `fx` never triggers React renders.

Session memory: `sessionStorage['rg.intro']` is set when the intro finishes or is skipped; on the next load in the same session the intro is bypassed. Mode preference (`quick` / `cinematic`) is stored in `localStorage['rg.mode']` **only when the visitor chooses it** — automatic WebGL fall-backs are not persisted.

## Rendering strategy

| Concern | Approach |
| --- | --- |
| Thousands of stars | One `THREE.Points` with a custom shader; position wrapping (`mod`) happens on the GPU. |
| Hyperspace streaks | One `InstancedBufferGeometry` quad per streak; the vertex shader projects head/tail and builds a screen-space ribbon (this is also the "motion blur"). 1 draw call. |
| Planets | Procedural: simplex-noise shader surfaces (Neural Nexus, Container Prime), instanced boxes/glyphs for rings and containers, LineSegments with animated pulse shader for the neural net. No downloaded assets. |
| Glow | Fresnel rim shader (`Atmosphere`) driven by a shared `glow` ref that lerps on hover/focus; global bloom stays subtle (threshold 0.62). |
| Hit-testing | Each world has one invisible sphere as pointer target (cheap & forgiving). |
| Quality tiers | `src/utils/quality.ts`: `high / medium / low` from viewport & cores. Controls DPR cap (2 / 1.5 / 1.25), star & streak counts, nebula octaves, post-processing, cockpit detail. drei `PerformanceMonitor` steps the tier down if FPS drops. |
| Tab hidden | `frameloop="never"` while `document.hidden`. |
| Cleanup | Every custom geometry / material created in `useMemo` is disposed in a `useEffect` cleanup; the director kills timelines and resets `fx` on unmount. |
| WebGL failure | `isWebGLAvailable()` at boot, an `ErrorBoundary` around the Canvas, and a `webglcontextlost` watchdog → Quick Profile. |

## Camera

`CameraRig` holds `rig.pos` / `rig.target` (Vector3). GSAP tweens them; `useFrame` copies to the camera, adds damped pointer parallax, hyperspace shake and FOV boost.

* Home pose (desktop): looking at the arc of worlds. Home pose (compact/portrait): looks at the *browsed* planet — a carousel instead of dragging.
* Focus pose: camera sits on the line planet→home at `radius × 3.9` (`× 5.4` compact) and the look target is offset so the planet lands in the free area beside the panel (computed from panel width / height and FOV).
* Planet-to-planet travel is routed **through the home pose** (timeline of two tweens), so the camera can never slice through a neighbouring world.

## Layout

`src/utils/layout.ts` is the single source of truth for planet positions, sizes and the compact-layout rule (`width ≤ 760 || aspect < 1.05`). CSS uses the equivalent media query for the bottom-sheet panels.

## Content layer

`src/data/*.json` → `src/data/index.ts` (typed exports). Nothing is hard-coded in components. Empty strings mean "not provided": links render as disabled controls, lists show explicit notes, and RAVI-AI says the information isn't available instead of guessing. Items with `"status": "sample"` display a **SAMPLE** badge.

## RAVI-AI provider interface (`src/components/Assistant/engine.ts`)

```ts
interface AssistantProvider {
  id: string
  reply(question: string, history: ChatTurn[]): Promise<{ text: string; actions?: AssistantAction[] }>
}
```

* `localProvider` — intent matching over the JSON data. Every answer is generated from `profile / skills / projects / talks / navigation`, never free text about employment, certifications or achievements.
* `createRemoteProvider(endpoint)` — POSTs `{question, history}` to **your own** server-side proxy and falls back to `localProvider` on any error. Enabled when `VITE_ASSISTANT_ENDPOINT` is set at build time. **API keys must live only on that proxy**, never in browser code.
* `setProvider(p)` — swap in any provider at runtime.

## Audio

`src/utils/audio.ts` synthesises everything with WebAudio (hum, click, hover, hologram arpeggio, hyperspace sweep). The `AudioContext` is created only after the visitor presses the sound toggle (autoplay-safe). Default state: off, not persisted.

## Bundles

`vite.config.ts` splits `vendor-three` (three + postprocessing), `vendor-r3f`, `vendor-gsap`; the 3D chunk is lazy so the Quick Profile never pays for it.
