export type Quality = 'high' | 'medium' | 'low'

export interface QualityConfig {
  dprMax: number
  tunnelStars: number
  shellStars: number
  streaks: number
  dust: number
  postfx: boolean
  nebula: boolean
  nebulaOctaves: number
  holoPoints: number
  cockpitDetail: boolean
}

const CONFIGS: Record<Quality, QualityConfig> = {
  high: { dprMax: 2, tunnelStars: 5000, shellStars: 5000, streaks: 3200, dust: 160, postfx: true, nebula: true, nebulaOctaves: 5, holoPoints: 1800, cockpitDetail: true },
  medium: { dprMax: 1.5, tunnelStars: 3000, shellStars: 3200, streaks: 1800, dust: 90, postfx: true, nebula: true, nebulaOctaves: 3, holoPoints: 1100, cockpitDetail: true },
  low: { dprMax: 1.25, tunnelStars: 1500, shellStars: 1700, streaks: 900, dust: 40, postfx: false, nebula: false, nebulaOctaves: 2, holoPoints: 600, cockpitDetail: false },
}

export const qualityConfig = (q: Quality): QualityConfig => CONFIGS[q]

export function detectQuality(): Quality {
  const w = window.innerWidth
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency || 4
  if (w < 768 || (coarse && w < 1024)) return 'low'
  if (w < 1100 || cores <= 4) return 'medium'
  return 'high'
}

export const lowerQuality = (q: Quality): Quality => (q === 'high' ? 'medium' : 'low')
