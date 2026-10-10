import * as THREE from 'three'

/** Draws a tiny procedural sci-fi readout (gauges, bars, grid) – no image assets needed. */
export function makePanelTexture(seed: number, color: string): THREE.CanvasTexture {
  const w = 384
  const h = 192
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  let s = seed * 9301 + 49297
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  g.fillStyle = 'rgba(2,10,22,0.92)'
  g.fillRect(0, 0, w, h)
  g.strokeStyle = color
  g.fillStyle = color
  g.lineWidth = 2
  g.globalAlpha = 0.9
  g.strokeRect(3, 3, w - 6, h - 6)
  g.globalAlpha = 0.18
  for (let x = 12; x < w; x += 24) {
    g.beginPath()
    g.moveTo(x, 8)
    g.lineTo(x, h - 8)
    g.stroke()
  }
  for (let y = 12; y < h; y += 24) {
    g.beginPath()
    g.moveTo(8, y)
    g.lineTo(w - 8, y)
    g.stroke()
  }
  g.globalAlpha = 1
  // bar graph
  for (let i = 0; i < 14; i++) {
    const bh = 14 + rnd() * 70
    g.globalAlpha = 0.5 + rnd() * 0.5
    g.fillRect(16 + i * 12, h - 20 - bh, 8, bh)
  }
  // gauge
  g.globalAlpha = 1
  g.beginPath()
  g.arc(w - 74, 74, 48, Math.PI * 0.8, Math.PI * 2.2)
  g.lineWidth = 6
  g.stroke()
  g.beginPath()
  g.lineWidth = 3
  g.moveTo(w - 74, 74)
  const a = Math.PI * (0.9 + rnd() * 1.2)
  g.lineTo(w - 74 + Math.cos(a) * 40, 74 + Math.sin(a) * 40)
  g.stroke()
  // text-like strips
  g.globalAlpha = 0.75
  for (let i = 0; i < 5; i++) g.fillRect(w - 140, 138 + i * 9, 30 + rnd() * 90, 4)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
