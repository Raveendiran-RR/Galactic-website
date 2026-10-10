# RAVEENDIRAN.COM — The Galactic Architect

An original, cinematic 3D portfolio for **Raveendiran R.R.** — AI Architect · Agentic AI Engineer · Cloud-Native Specialist.
Built with Vite, React, TypeScript, React Three Fiber, GSAP, Tailwind CSS and Zustand. It compiles to **plain static files** (no Node.js in production, no backend) and deploys to Hostinger shared hosting.

> The visual identity is *inspired by the atmosphere* of classic space-opera cinema, but contains no franchise logos, characters, ship models, fonts, music or sound effects. All geometry is procedural, all audio is synthesised with WebAudio, and fonts are open-licence (Orbitron, Rajdhani, Share Tech Mono via `@fontsource`).

## What's inside

| Experience | What it does |
| --- | --- |
| **Cinematic intro** | Black screen → stars appear → opening line → motto → name reveal. `[ SKIP INTRO ]` is always visible and the choice is remembered for the session. |
| **Hyperspace jump** | ~3 s jump: 3,000+ instanced light streaks (one draw call), camera shake, FOV punch, chromatic aberration, flash, smooth deceleration. |
| **Galactic command center** | First-person cockpit, holographic spiral-galaxy map, distant space station, a huge planet below, nebula, dust. |
| **Six destinations** | Neural Nexus · Container Prime · Architect's Forge · Project Nebula · Broadcast Station · Commander's Archive. Hover = glow + label; click = GSAP camera flight + holographic panel. |
| **RAVI-AI** | Floating orb in the cockpit + chat. Version 1 is a **local, JSON-driven knowledge base** with a clean provider interface for a future LLM. |
| **Terminal** | `help whoami skills projects github talks resume contact galaxy clear` (+ `open`, `quick`). History, Tab-completion, "did you mean". |
| **Quick Profile** | Fast, traditional page (hero, about, skills, projects, speaking, career, contact). Works without WebGL and doesn't even download three.js. |
| **Sound** | Off by default. `[ SOUND ON / OFF ]` enables synthesised hum, clicks and a hyperspace whoosh. |

## Run it on any machine

### 1. Prerequisites

| Tool | Version | Check |
| --- | --- | --- |
| Node.js (includes npm) | **20 or newer** (developed on 24) | `node -v` |
| Git (to clone) | any recent | `git --version` |
| A modern browser | WebGL-capable (Chrome, Edge, Firefox, Safari) | |

Install Node.js if missing:

* **macOS:** `brew install node` or the installer from <https://nodejs.org>
* **Windows:** installer from <https://nodejs.org> (or `winget install OpenJS.NodeJS.LTS`)
* **Linux:** use your package manager, or [nvm](https://github.com/nvm-sh/nvm): `nvm install --lts`

### 2. Get the code and start

```bash
git clone <your-repo-url> raveendiran-galaxy
cd raveendiran-galaxy
npm install
npm run dev
```

Open <http://localhost:5173>. Edits hot-reload. Stop with `Ctrl+C`.

> Port busy? `npm run dev -- --port 3000`. To test on a phone on the same Wi-Fi: `npm run dev -- --host` and open the printed *Network* URL.

### 3. Build and preview the production site

```bash
npm run build      # type-checks, then writes static files to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

`dist/` is plain HTML/CSS/JS — it can be served by any static host (see [DEPLOYMENT.md](DEPLOYMENT.md)) or locally with e.g. `npx serve dist`.

### 4. Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then build static site to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

### Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm install` fails with peer-dependency errors | Use Node 20+ and a clean install: `rm -rf node_modules package-lock.json && npm install` |
| Blank page / "WebGL not supported" | Enable hardware acceleration in the browser; the Quick Profile still works without WebGL |
| 3D is slow | The site lowers quality automatically; close heavy tabs or try Chrome/Edge |
| Intro doesn't replay | It's remembered per session — open a new tab/private window or clear `sessionStorage` |
| Want the cinematic mode back after choosing Quick | Click **Enter cinematic experience** (preference is stored in `localStorage`) |

## Controls

* **Mouse:** hover a world for its description, click to fly there. Click the glowing markers on the cockpit map too.
* **Keyboard:** `←` / `→` browse destinations, `Enter` explore, `Esc` return / close, `` ` `` toggles the terminal. All destinations are also real `<button>`s in the left rail.
* **Touch:** a carousel (‹ ›, **Explore**) replaces dragging — no gestures required.
* **Reduced motion:** `prefers-reduced-motion` swaps the intro for opacity-only fades, replaces hyperspace with a short crossfade, and disables shake, parallax and drifting.

## Editing content

Everything personal lives in `src/data/*.json`. See **[CUSTOMIZATION.md](CUSTOMIZATION.md)**.
Items not yet supplied (GitHub URL, email, LinkedIn, resume, certifications, real projects/talks) are intentionally empty or marked **SAMPLE**; the UI degrades gracefully and never shows dead links or invented facts.

## Deploying

`npm run build`, then upload the **contents** of `dist/` to `public_html` on Hostinger. Full steps and a verification checklist: **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## Architecture

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the scene graph, state model, performance strategy and the RAVI-AI provider interface.

## Browser support

Any modern evergreen browser with WebGL 2 or WebGL 1. If WebGL is missing, fails, or the GPU context is lost for more than 4 s, the site falls back to the Quick Profile automatically.

## License

Licensed under the **Apache License, Version 2.0** — see [LICENSE](LICENSE).

## Disclaimer — use at your own risk

This software is provided **"as is", without warranty of any kind**, and the author accepts **no liability** for any damage or loss resulting from its use. You are responsible for reviewing, testing and securing anything you deploy. Full text: [DISCLAIMER.md](DISCLAIMER.md).
