import gsap from 'gsap'
import { fx, resetFx } from '../stores/fx'
import { useApp } from '../stores/useApp'
import { KEYS, safeSession } from './storage'
import { sfx } from './audio'

let warpTl: gsap.core.Timeline | null = null

export const introAlreadyHandled = () => safeSession.get(KEYS.intro) !== null

/** Hyperspace jump: ~3s of acceleration → jump flash → deceleration into the galaxy. */
export function startHyperspace(opts: { short?: boolean } = {}) {
  const app = useApp.getState()
  if (app.phase !== 'intro') return
  safeSession.set(KEYS.intro, opts.short ? 'skipped' : 'seen')
  warpTl?.kill()
  fx.stars = 1
  fx.reveal = 0

  if (app.reducedMotion) {
    // no streaks, shake or zoom: a short crossfade through white
    warpTl = gsap
      .timeline()
      .to(fx, { flash: 1, duration: 0.35 })
      .call(() => useApp.getState().setPhase('galaxy'))
      .to(fx, { reveal: 1, duration: 0.6, ease: 'none' }, '>')
      .to(fx, { flash: 0, duration: 0.5 }, '<')
    return
  }

  const d = opts.short ? 0.6 : 1
  app.setPhase('hyperspace')
  app.setWarpActive(true)
  sfx.hyperspace()
  warpTl = gsap
    .timeline({ onComplete: () => useApp.getState().setWarpActive(false) })
    .to(fx, { speed: 1, duration: 1.0 * d, ease: 'power2.in' }, 0)
    .to(fx, { shake: 1, warp: 1, duration: 1.0 * d, ease: 'power2.in' }, 0)
    .to(fx, { fovBoost: 32, duration: 1.7 * d, ease: 'power2.in' }, 0)
    .to(fx, { flash: 1, duration: 0.22, ease: 'power2.in' }, 1.9 * d)
    .call(() => useApp.getState().setPhase('galaxy'), [], 2.12 * d)
    .to(fx, { flash: 0, duration: 0.8, ease: 'power2.out' }, 2.14 * d)
    .to(fx, { speed: 0.03, duration: 1.0 * d, ease: 'power3.out' }, 2.1 * d)
    .to(fx, { shake: 0, warp: 0, fovBoost: 0, duration: 1.0 * d, ease: 'power3.out' }, 2.1 * d)
    .to(fx, { reveal: 1, duration: 1.7, ease: 'none' }, 2.14 * d)
}

export function skipIntro() {
  startHyperspace({ short: true })
}

export function resetDirector() {
  warpTl?.kill()
  warpTl = null
  resetFx()
  useApp.setState({ warpActive: false, phase: 'intro', focus: null })
}
