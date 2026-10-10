import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send, X } from 'lucide-react'
import { useApp } from '../../stores/useApp'
import { sfx } from '../../utils/audio'
import { GREETING, STARTERS, getProvider, type AssistantAction, type ChatTurn } from './engine'

interface Msg extends ChatTurn {
  id: number
  actions?: AssistantAction[]
}

let uid = 1

export function AssistantChat() {
  const setTool = useApp((s) => s.setTool)
  const pending = useApp((s) => s.pendingQuestion)
  const clearQuestion = useApp((s) => s.clearQuestion)
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, role: 'assistant', text: GREETING }])
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const log = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const msgsRef = useRef(msgs)
  msgsRef.current = msgs

  const ask = async (q: string) => {
    const text = q.trim()
    if (!text || busy) return
    sfx.click()
    const history = msgsRef.current.map(({ role, text }) => ({ role, text }))
    setMsgs((m) => [...m, { id: uid++, role: 'user', text }])
    setBusy(true)
    const [reply] = await Promise.all([getProvider().reply(text, history), new Promise((r) => setTimeout(r, 420))])
    setMsgs((m) => [...m, { id: uid++, role: 'assistant', text: reply.text, actions: reply.actions }])
    setBusy(false)
    sfx.holo()
  }

  // questions sent from elsewhere in the UI ("Ask RAVI-AI about this")
  useEffect(() => {
    if (pending) {
      void ask(pending)
      clearQuestion()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  useEffect(() => {
    input.current?.focus()
  }, [])
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, busy])

  const runAction = (a: AssistantAction) => {
    sfx.click()
    const app = useApp.getState()
    if (a.kind === 'planet') app.focusPlanet(a.planet, a.tab)
    else if (a.kind === 'link') window.open(a.href, a.href.startsWith('mailto:') ? '_self' : '_blank', 'noopener,noreferrer')
    else if (a.kind === 'ask') void ask(a.question)
    else if (a.kind === 'quick') app.setMode('quick')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = value
    setValue('')
    void ask(q)
  }

  return (
    <section className="dock dock-chat holo-panel" aria-label="RAVI-AI assistant">
      <div className="dock-head">
        <span>◉ RAVI-AI // NAVIGATION COMPANION</span>
        <button className="icon-btn" aria-label="Close assistant" onClick={() => setTool(null)}>
          <X size={16} />
        </button>
      </div>
      <div className="chat-log" ref={log} role="log" aria-live="polite">
        {msgs.map((m) => (
          <div key={m.id} className={`msg ${m.role === 'user' ? 'me' : 'ai'}`}>
            {m.text}
            {m.actions && m.actions.length > 0 && (
              <div className="msg-actions">
                {m.actions.map((a, i) => (
                  <button key={i} className="btn-holo sm" onClick={() => runAction(a)}>
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="msg ai typing" aria-label="RAVI-AI is thinking">
            <span />
            <span />
            <span />
          </div>
        )}
        {msgs.length === 1 && (
          <div className="msg-actions" style={{ position: 'relative' }}>
            {STARTERS.map((s) => (
              <button key={s} className="btn-holo sm" style={{ textTransform: 'none', letterSpacing: '0.04em', fontFamily: 'var(--font-body)', fontSize: 14 }} onClick={() => void ask(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <form className="chat-form" onSubmit={submit}>
        <input ref={input} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ask about skills, projects, talks…" aria-label="Message RAVI-AI" />
        <button className="btn-holo amber" type="submit" aria-label="Send" disabled={busy}>
          <Send size={14} />
        </button>
      </form>
    </section>
  )
}
