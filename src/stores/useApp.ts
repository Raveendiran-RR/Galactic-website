import { create } from 'zustand'
import { planets, type PlanetId } from '../data'
import { detectQuality, lowerQuality, type Quality } from '../utils/quality'
import { safeLocal, KEYS } from '../utils/storage'
import { isWebGLAvailable } from '../utils/webgl'

export type Mode = 'cinematic' | 'quick'
export type Phase = 'intro' | 'hyperspace' | 'galaxy'
export type Tool = 'terminal' | 'assistant' | null

interface AppState {
  mode: Mode
  phase: Phase
  webgl: boolean
  reducedMotion: boolean
  quality: Quality
  focus: PlanetId | null
  panelTab: string | null
  hovered: PlanetId | null
  browse: number
  soundOn: boolean
  tool: Tool
  warpActive: boolean
  pendingQuestion: string | null

  setMode: (m: Mode) => void
  /** automatic fallback (WebGL failure): never persisted as the visitor's preference */
  fallbackToQuick: () => void
  setPhase: (p: Phase) => void
  focusPlanet: (id: PlanetId, tab?: string) => void
  returnToGalaxy: () => void
  setHovered: (id: PlanetId | null) => void
  browseBy: (delta: number) => void
  setSoundOn: (on: boolean) => void
  setTool: (t: Tool) => void
  degradeQuality: () => void
  setWarpActive: (on: boolean) => void
  askAssistant: (q: string) => void
  clearQuestion: () => void
}

const webgl = isWebGLAvailable()
const savedMode = safeLocal.get(KEYS.mode)
const reduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export const useApp = create<AppState>((set, get) => ({
  mode: !webgl ? 'quick' : savedMode === 'quick' ? 'quick' : 'cinematic',
  phase: 'intro',
  webgl,
  reducedMotion: reduced,
  quality: detectQuality(),
  focus: null,
  panelTab: null,
  hovered: null,
  browse: 2,
  soundOn: false,
  tool: null,
  warpActive: false,
  pendingQuestion: null,

  setMode: (mode) => {
    safeLocal.set(KEYS.mode, mode)
    set({ mode, focus: null, tool: null, hovered: null, ...(mode === 'cinematic' ? { phase: 'intro' as Phase } : {}) })
  },
  fallbackToQuick: () => set({ mode: 'quick', focus: null, tool: null, hovered: null }),
  setPhase: (phase) => set({ phase }),
  focusPlanet: (id, tab) => {
    set({ focus: id, panelTab: tab ?? null, browse: planets.findIndex((p) => p.id === id) })
  },
  returnToGalaxy: () => set({ focus: null, panelTab: null }),
  setHovered: (hovered) => {
    if (get().hovered !== hovered) set({ hovered })
  },
  browseBy: (delta) => {
    const n = planets.length
    set({ browse: (get().browse + delta + n) % n })
  },
  setSoundOn: (soundOn) => set({ soundOn }),
  setTool: (tool) => set({ tool }),
  degradeQuality: () => set({ quality: lowerQuality(get().quality) }),
  setWarpActive: (warpActive) => set({ warpActive }),
  askAssistant: (q) => set({ tool: 'assistant', pendingQuestion: q }),
  clearQuestion: () => set({ pendingQuestion: null }),
}))
