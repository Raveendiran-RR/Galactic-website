import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../../stores/useApp'
import { sfx } from '../../utils/audio'
import { COMMANDS, run, suggest, type Line, type TerminalEffects } from './commands'

const PROMPT = 'ravi@galactic-command:~$'
const BANNER: Line[] = [
  { kind: 'acc', text: 'GALACTIC COMMAND TERMINAL v1.0' },
  { kind: 'out', text: "Welcome aboard. Type 'help' to list commands. Tab completes, ↑/↓ browse history." },
]

export function Terminal() {
  const setTool = useApp((s) => s.setTool)
  const [lines, setLines] = useState<Line[]>(BANNER)
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)
  const log = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  const effects = useMemo<TerminalEffects>(
    () => ({
      openUrl: (u) => window.open(u, '_blank', 'noopener,noreferrer'),
      download: (u) => {
        const a = document.createElement('a')
        a.href = u
        a.download = ''
        document.body.appendChild(a)
        a.click()
        a.remove()
      },
      returnToGalaxy: () => useApp.getState().returnToGalaxy(),
      focusPlanet: (id, tab) => useApp.getState().focusPlanet(id, tab),
      setQuick: () => useApp.getState().setMode('quick'),
    }),
    [],
  )

  useEffect(() => {
    input.current?.focus()
  }, [])
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight })
  }, [lines])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const cmd = value.trim()
    sfx.click()
    setValue('')
    setCursor(-1)
    if (!cmd) return
    setHistory((h) => [...h, cmd])
    const result = run(cmd, effects)
    if (result === 'clear') setLines([])
    else setLines((l) => [...l, { kind: 'in', text: `${PROMPT} ${cmd}` }, ...result])
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1)
      setCursor(next)
      setValue(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (cursor < 0) return
      const next = cursor + 1
      if (next >= history.length) {
        setCursor(-1)
        setValue('')
      } else {
        setCursor(next)
        setValue(history[next])
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const s = suggest(value.split(/\s+/)[0] ?? '')
      if (s.length) setValue(s[0] + (value.includes(' ') ? value.slice(value.indexOf(' ')) : ' '))
    }
  }

  const suggestions = value.trim() ? suggest(value.trim().split(/\s+/)[0]) : COMMANDS.slice(0, 6).map((c) => c.name)

  return (
    <section className="dock dock-terminal holo-panel" aria-label="Command terminal" onClick={() => input.current?.focus()}>
      <div className="dock-head">
        <span>▮ COMMAND CONSOLE</span>
        <button className="icon-btn" aria-label="Close terminal" onClick={() => setTool(null)}>
          <X size={16} />
        </button>
      </div>
      <div className="term-out" ref={log} role="log" aria-live="polite">
        {lines.map((l, i) =>
          l.kind === 'link' ? (
            <pre key={i}>
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                {l.text}
              </a>
            </pre>
          ) : (
            <pre key={i} className={`l-${l.kind}`}>
              {l.text}
            </pre>
          ),
        )}
      </div>
      <div className="suggest">
        {suggestions.slice(0, 8).map((s) => (
          <button
            key={s}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setValue(s)
              input.current?.focus()
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <form className="term-form" onSubmit={submit}>
        <label htmlFor="term-input">{PROMPT}</label>
        <input
          id="term-input"
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Terminal command"
        />
      </form>
    </section>
  )
}
