import { useApp } from '../stores/useApp'

// Fully synthesised, original UI audio. Nothing is loaded from disk and nothing
// plays until the visitor explicitly turns sound on (browser autoplay rules).
let ctx: AudioContext | null = null
let master: GainNode | null = null
let hum: { stop: () => void } | null = null

const isOn = () => useApp.getState().soundOn && ctx && master

function noiseBuffer(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function tone(freq: number, dur: number, opts: { type?: OscillatorType; gain?: number; delay?: number; to?: number } = {}) {
  if (!isOn() || !ctx || !master) return
  const { type = 'sine', gain = 0.12, delay = 0, to } = opts
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function startHum() {
  if (!ctx || !master || hum) return
  const c = ctx
  const out = c.createGain()
  out.gain.value = 0.0001
  out.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 1.5)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 260
  const o1 = c.createOscillator()
  const o2 = c.createOscillator()
  o1.type = 'sawtooth'
  o2.type = 'sine'
  o1.frequency.value = 55
  o2.frequency.value = 82.6
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.frequency.value = 0.15
  lfoGain.gain.value = 60
  lfo.connect(lfoGain).connect(lp.frequency)
  o1.connect(lp)
  o2.connect(lp)
  lp.connect(out).connect(master)
  o1.start()
  o2.start()
  lfo.start()
  hum = {
    stop() {
      out.gain.cancelScheduledValues(c.currentTime)
      out.gain.setTargetAtTime(0.0001, c.currentTime, 0.2)
      window.setTimeout(() => {
        o1.stop()
        o2.stop()
        lfo.stop()
      }, 900)
      hum = null
    },
  }
}

export function setAudioEnabled(on: boolean) {
  if (on) {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      ctx = new AC()
      master = ctx.createGain()
      master.gain.value = 0.8
      master.connect(ctx.destination)
    }
    void ctx.resume()
    useApp.getState().setSoundOn(true)
    startHum()
    sfx.confirm()
  } else {
    useApp.getState().setSoundOn(false)
    hum?.stop()
  }
}

export const sfx = {
  click: () => tone(880, 0.07, { type: 'square', gain: 0.05, to: 440 }),
  hover: () => tone(1320, 0.05, { type: 'sine', gain: 0.035 }),
  confirm: () => {
    tone(520, 0.12, { gain: 0.08 })
    tone(780, 0.18, { gain: 0.08, delay: 0.09 })
  },
  holo: () => {
    ;[440, 660, 880, 1320].forEach((f, i) => tone(f, 0.16, { gain: 0.05, delay: i * 0.06 }))
  },
  hyperspace: () => {
    if (!isOn() || !ctx || !master) return
    const c = ctx
    const t = c.currentTime
    const src = c.createBufferSource()
    src.buffer = noiseBuffer(c, 3.2)
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1.2
    bp.frequency.setValueAtTime(180, t)
    bp.frequency.exponentialRampToValueAtTime(3800, t + 1.4)
    bp.frequency.exponentialRampToValueAtTime(240, t + 3)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.28, t + 1.1)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.1)
    src.connect(bp).connect(g).connect(master)
    src.start(t)
    tone(70, 3, { type: 'sawtooth', gain: 0.07, to: 520 })
  },
}
