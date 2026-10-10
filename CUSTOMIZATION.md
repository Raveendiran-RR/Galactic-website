# Customization guide

All content is JSON in `src/data/`. After editing, `npm run dev` hot-reloads; `npm run build` produces the new `dist/`.

> Rule of thumb: **empty string / empty array = "not provided"**. The UI then hides or disables the item and RAVI-AI says the information isn't available. Never fill a field with a guess.

## Name & headline — `src/data/profile.json`

```json
"name": "Raveendiran R.R.",
"headline": "Architecting Intelligent Systems. Engineering Developer Experiences.",
"tagline": "From Enterprise Systems to Intelligent Agents.",
"introLines": { "opening": "...", "motto": "ONE ARCHITECT. INFINITE POSSIBILITIES.", "title": "THE GALACTIC ARCHITECT", "domains": "AI • CLOUD NATIVE • AGENTIC SYSTEMS" }
```
`introLines.motto` is split on `". "` into lines. Page title / meta description: `index.html`.

## Profile, summary, specialisations

`summary`, `positioning`, `specializations`, `roles`, `experience.years`.
`affiliationNote` appears in About and keeps expertise separate from employment (e.g. no implication of employment by Docker). Keep it accurate.

## Career timeline, leadership, certifications

* `timeline[]`: `{ "period", "title", "detail", "status" }`. Use `"status": "profile"` for real entries; the placeholder entry with `"status": "sample"` shows a SAMPLE badge — delete it once you add real roles.
* `leadership.highlights`: array of strings (empty by default).
* `certifications`: array of strings (empty by default).

## Skills — `src/data/skills.json`

`groups[]` → `{ id, label, items[] }`. The `id`s `ai`, `cloud`, `systems`, `advocacy` are referenced by `navigation.json` (`skillGroup`).

## Projects & GitHub links — `src/data/projects.json`

```json
{
  "id": "docker-agent-sandbox",
  "title": "Secure AI Agent Sandbox",
  "description": "Exploring isolated environments for AI agents",
  "category": "AI Security",
  "technologies": ["Docker", "MCP", "AI Agents"],
  "github": "https://github.com/you/repo",
  "demo": "",
  "architecture": ["Step 1…", "Step 2…"],
  "status": "verified"
}
```
* Set `status` to anything other than `"sample"` (e.g. `"verified"`) to remove the SAMPLE badge.
* Leave `github` / `demo` as `""` when there is no URL — the buttons render disabled.
* `technologies` also decide which projects appear on Neural Nexus / Container Prime / Architect's Forge (matched against the planet's topics in `navigation.json`).
* Your GitHub **profile** URL goes in `profile.json → contact.github` (powers the terminal `github` command and the Contact panel).

## Speaking engagements — `src/data/talks.json`

`items[]` → `{ id, type, title, event, date, url, status }` with `type` one of `talk | webinar | community | article | video`. Replace the SAMPLE rows; set `status` to `"verified"`; add `url` when public.

## Contact information

`profile.json → contact`: `email`, `linkedin`, `github`, `x`, `youtube`, `location`, `collaborateMessage`. Only non-empty fields are shown. The **HIRE / COLLABORATE** button opens the Contact tab (3D) or scrolls to #contact (Quick Profile).

## Resume

1. Put the PDF in `public/` (e.g. `public/resume.pdf` — it is copied to the site root).
2. Set `profile.json → resume.url` to `"./resume.pdf"`.
The button, terminal `resume` command and RAVI-AI then all offer the download. With an empty URL they honestly say none is published.

## Destinations (planets)

`src/data/navigation.json`: `name`, `category`, `description` (hover text), `color`, `topics`, `terminalAlias`, `assistantQuestion`. IDs are fixed because the 3D models are bound to them (`src/scenes/GalaxyScene.tsx`). To change positions / sizes use `src/utils/layout.ts`.

## Look & feel

* Colours: CSS variables at the top of `src/styles/index.css`; 3D accent colours per planet in `navigation.json`.
* Intro timing: `src/components/Intro/IntroOverlay.tsx` (GSAP timeline positions in seconds).
* Hyperspace length/feel: `src/utils/director.ts`.
* Quality tiers: `src/utils/quality.ts`.

## RAVI-AI

* Add intents / keywords: `INTENTS` in `src/components/Assistant/engine.ts` (each intent builds its answer from the JSON data).
* Connect an LLM later: implement `AssistantProvider` or set `VITE_ASSISTANT_ENDPOINT` to your own proxy URL at build time (`VITE_ASSISTANT_ENDPOINT=https://api.raveendiran.com/chat npm run build`). Never put provider API keys in this front-end code.

## Terminal

Add a command by appending to `COMMANDS` in `src/components/Terminal/commands.ts` (`name`, `help`, `run`). `help` lists it automatically.

## Optional 3D models, textures, audio

Everything is procedural, but you can drop files in `public/assets/models`, `textures`, `audio`; they are copied to `dist/assets/...` and referenced as `./assets/models/your.glb`.
