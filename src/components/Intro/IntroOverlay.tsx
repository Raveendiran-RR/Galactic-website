import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { profile } from '../../data'
import { fx } from '../../stores/fx'
import { useApp } from '../../stores/useApp'
import { skipIntro, startHyperspace } from '../../utils/director'
import { SoundToggle } from '../UI/SoundToggle'

export function IntroOverlay() {
  const root = useRef<HTMLDivElement>(null)
  const reduced = useApp((s) => s.reducedMotion)
  const setMode = useApp((s) => s.setMode)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      gsap.set(['.t1', '.t2', '.t3 > *'], { opacity: 0 })
      fx.stars = 0
      // setTimeout escapes the gsap.context so the hyperspace timeline survives this component unmounting
      const tl = gsap.timeline({ onComplete: () => void window.setTimeout(() => startHyperspace(), 0) })

      if (reduced) {
        // opacity-only sequence, no drifting stars or letter-spacing animation
        fx.stars = 1
        tl.to(q('.t1'), { opacity: 1, duration: 0.6 })
          .to(q('.t1'), { opacity: 0, duration: 0.6 }, '+=2.2')
          .to(q('.t2'), { opacity: 1, duration: 0.6 })
          .to(q('.t2'), { opacity: 0, duration: 0.6 }, '+=2.2')
          .to(q('.t3 > *'), { opacity: 1, duration: 0.6, stagger: 0.2 })
          .to({}, { duration: 3 })
        return
      }

      tl.to(fx, { stars: 1, duration: 4, ease: 'power1.inOut' }, 0)
        // scene 1 — the darkness, then the opening line
        .fromTo(q('.t1'), { opacity: 0, y: 12, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power2.out' }, 0.9)
        .to(q('.t1'), { opacity: 0, filter: 'blur(6px)', duration: 0.9, ease: 'power2.in' }, 3.9)
        // scene 2 — the motto
        .fromTo(q('.t2'), { opacity: 0, letterSpacing: '0.6em', scale: 1.08 }, { opacity: 1, letterSpacing: '0.12em', scale: 1, duration: 1.8, ease: 'power3.out' }, 5.0)
        .to(q('.t2'), { opacity: 0, scale: 0.94, duration: 0.8, ease: 'power2.in' }, 7.7)
        // scene 3 — the name
        .fromTo(q('.intro-name'), { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: 'power3.out' }, 8.7)
        .fromTo(q('.intro-title'), { opacity: 0, letterSpacing: '1em' }, { opacity: 1, letterSpacing: '0.5em', duration: 1.2, ease: 'power2.out' }, 9.2)
        .fromTo(q('.intro-domains'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.9 }, 9.8)
        .fromTo(q('.intro-cta'), { opacity: 0 }, { opacity: 1, duration: 0.7 }, 10.4)
        .to({}, { duration: 2.2 }, 10.4) // hold, then auto-engage
    }, root)
    return () => ctx.kill()
  }, [reduced])

  return (
    <div ref={root} className="absolute inset-0" role="region" aria-label="Cinematic introduction">
      <div className="corner-skip" style={{ display: 'flex', gap: 8 }}>
        <button className="btn-holo" onClick={() => setMode('quick')}>
          Quick profile
        </button>
        <button className="btn-holo amber" onClick={skipIntro} autoFocus>
          [ SKIP INTRO ]
        </button>
      </div>
      <div style={{ position: 'absolute', top: 16, left: 18, zIndex: 5 }}>
        <SoundToggle />
      </div>
      <div className="intro">
        <p className="t1 intro-opening">{profile.introLines.opening}</p>
        <p className="t2 intro-motto">
          {profile.introLines.motto.split('. ').map((l, i, a) => (
            <span key={i} style={{ display: 'block' }}>
              {l}
              {i < a.length - 1 ? '.' : ''}
            </span>
          ))}
        </p>
        <div className="t3">
          <h1 className="intro-name">{profile.name.toUpperCase()}</h1>
          <div className="intro-title">{profile.introLines.title}</div>
          <div className="intro-domains">{profile.introLines.domains.split('•').map((d, i) => (
              <span key={i}>
                {i > 0 && <span style={{ fontFamily: 'system-ui, sans-serif', margin: '0 0.7em' }}>•</span>}
                {d.trim()}
              </span>
            ))}</div>
          <div className="intro-cta">
            <button className="btn-holo amber" onClick={() => startHyperspace()}>
              [ ENGAGE HYPERDRIVE ]
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
