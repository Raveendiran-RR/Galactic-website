import { useEffect } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Bot, TerminalSquare, Zap, LayoutList } from 'lucide-react'
import { planets, profile } from '../../data'
import { useApp } from '../../stores/useApp'
import { sfx } from '../../utils/audio'
import { SoundToggle } from '../UI/SoundToggle'
import { openHire } from '../UI/hire'

function ReturnButton() {
  const returnToGalaxy = useApp((s) => s.returnToGalaxy)
  return (
    <div className="return-wrap">
      <button
        className="btn-holo amber"
        onClick={() => {
          sfx.click()
          returnToGalaxy()
        }}
      >
        <ArrowLeft size={14} /> [ RETURN TO GALAXY ]
      </button>
    </div>
  )
}

function useHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      const app = useApp.getState()
      if (e.key === 'Escape') {
        if (app.tool) app.setTool(null)
        else if (app.focus) app.returnToGalaxy()
        return
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === '`') {
        e.preventDefault()
        app.setTool(app.tool === 'terminal' ? null : 'terminal')
      } else if (e.key === 'ArrowRight' && !app.focus) {
        app.browseBy(1)
        app.setHovered(planets[useApp.getState().browse].id)
      } else if (e.key === 'ArrowLeft' && !app.focus) {
        app.browseBy(-1)
        app.setHovered(planets[useApp.getState().browse].id)
      } else if (e.key === 'Enter' && !app.focus && t === document.body) {
        sfx.click()
        app.focusPlanet(planets[app.browse].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export function Hud() {
  const focus = useApp((s) => s.focus)
  const browse = useApp((s) => s.browse)
  const hovered = useApp((s) => s.hovered)
  const tool = useApp((s) => s.tool)
  const setHovered = useApp((s) => s.setHovered)
  const setTool = useApp((s) => s.setTool)
  const focusPlanet = useApp((s) => s.focusPlanet)
  const browseBy = useApp((s) => s.browseBy)
  const setMode = useApp((s) => s.setMode)
  useHotkeys()
  const current = planets[browse]

  return (
    <div className="hud">
      <header className="hud-top">
        <div className="brand">
          <b>RAVEENDIRAN.COM</b>
          <small>GALACTIC COMMAND // ONLINE</small>
        </div>
        <div className="hud-actions">
          <button className="btn-holo" onClick={() => setMode('quick')}>
            <LayoutList size={14} /> <span className="lbl-full">Quick profile</span>
            <span className="lbl-short">Quick</span>
          </button>
          <SoundToggle />
          <button className="btn-holo amber" onClick={openHire}>
            <Zap size={14} /> <span className="lbl-full">HIRE / COLLABORATE</span>
            <span className="lbl-short">Hire</span>
          </button>
        </div>
      </header>

      {focus && <ReturnButton />}

      {/* desktop destination rail – also the keyboard-accessible alternative to clicking planets */}
      <nav className="nav-rail" aria-label="Galactic destinations">
        {planets.map((p) => (
          <button
            key={p.id}
            className="nav-item"
            style={{ ['--c' as string]: p.color }}
            data-active={focus === p.id || hovered === p.id}
            aria-current={focus === p.id ? 'true' : undefined}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(p.id)}
            onBlur={() => setHovered(null)}
            onClick={() => {
              sfx.click()
              sfx.holo()
              focusPlanet(p.id)
            }}
          >
            <i />
            <span>
              {p.name}
              <small>{p.category}</small>
            </span>
          </button>
        ))}
      </nav>

      <div className="hud-bottom">
        <button className="btn-holo" aria-pressed={tool === 'terminal'} onClick={() => setTool(tool === 'terminal' ? null : 'terminal')}>
          <TerminalSquare size={14} /> Terminal
        </button>
        <button className="btn-holo" aria-pressed={tool === 'assistant'} onClick={() => setTool(tool === 'assistant' ? null : 'assistant')}>
          <Bot size={14} /> RAVI-AI
        </button>
      </div>
      <div className="hint" aria-hidden="true">
        CLICK A WORLD · ←/→ BROWSE · ENTER EXPLORE · ESC RETURN · ` TERMINAL
      </div>

      {/* phones & portrait tablets: carousel + big touch targets, no dragging needed */}
      {!focus && (
        <div className="mobile-nav holo-panel" style={{ ['--c' as string]: current.color }}>
          <button className="btn-holo" aria-label="Previous destination" onClick={() => browseBy(-1)}>
            <ChevronLeft size={18} />
          </button>
          <div className="mid">
            <b>{current.name}</b>
            <small>{current.category}</small>
          </div>
          <button className="btn-holo" aria-label="Next destination" onClick={() => browseBy(1)}>
            <ChevronRight size={18} />
          </button>
          <div className="row">
            <button className="btn-holo amber" onClick={() => focusPlanet(current.id)}>
              Explore
            </button>
            <button className="btn-holo" onClick={() => setTool('terminal')}>
              <TerminalSquare size={14} />
            </button>
            <button className="btn-holo" onClick={() => setTool('assistant')}>
              <Bot size={14} /> AI
            </button>
          </div>
        </div>
      )}
      <p className="sr-only">
        Interactive 3D portfolio of {profile.name}. Use the destination buttons to explore each section, or switch to Quick Profile for a traditional page.
      </p>
    </div>
  )
}
