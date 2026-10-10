import { Vector3 } from 'three'
import { planets, type PlanetId } from '../data'

/** Phones and portrait tablets: bottom-sheet panels and one-planet-at-a-time browsing. */
export const isCompact = (w: number, h: number) => w <= 760 || w / h < 1.05

const ANGLES = [-29, -17.5, -6, 6, 17.5, 29]
const HEIGHTS = [2.6, -2.2, 3.0, -1.8, 2.6, -2.2]
const RADIUS = 23

export const HOME_POS = new Vector3(0, 1.2, 10)

export const PLANET_POS: Record<PlanetId, Vector3> = Object.fromEntries(
  planets.map((p, i) => {
    const a = (ANGLES[i] * Math.PI) / 180
    const r = RADIUS + (i % 2 ? 4 : 0)
    return [p.id, new Vector3(Math.sin(a) * r, HEIGHTS[i], HOME_POS.z - Math.cos(a) * r)]
  }),
) as Record<PlanetId, Vector3>

/** Visual radius of each destination, used for camera framing. */
export const PLANET_RADIUS: Record<PlanetId, number> = {
  'neural-nexus': 2.6,
  'container-prime': 2.4,
  'architects-forge': 3.6,
  'project-nebula': 3.4,
  'broadcast-station': 3.4,
  'commanders-archive': 3.4,
}

export interface Pose {
  pos: Vector3
  target: Vector3
}

const UP = new Vector3(0, 1, 0)
const TAN_HALF_FOV = Math.tan((55 / 2) * (Math.PI / 180))

export function homePose(compact: boolean, browse: number): Pose {
  if (!compact) return { pos: HOME_POS.clone(), target: new Vector3(-2.4, 0.2, -12) }
  const p = PLANET_POS[planets[browse].id]
  const pos = HOME_POS.clone().lerp(p, 0.06)
  const target = p.clone().add(new Vector3(0, -1.1, 0))
  return { pos, target }
}

export function focusPose(id: PlanetId, compact: boolean, w: number, h: number): Pose {
  const P = PLANET_POS[id]
  const D = PLANET_RADIUS[id] * (compact ? 5.4 : 3.9)
  const dir = HOME_POS.clone().sub(P).normalize()
  const pos = P.clone().addScaledVector(dir, D)
  const fwd = P.clone().sub(pos).normalize()
  const right = fwd.clone().cross(UP).normalize()
  const up = right.clone().cross(fwd).normalize()
  const target = P.clone()
  if (compact) {
    target.addScaledVector(up, -D * TAN_HALF_FOV * 0.55)
  } else {
    const panelPx = Math.min(520, w * 0.42)
    target.addScaledVector(right, (panelPx / h) * D * TAN_HALF_FOV * 0.95)
  }
  return { pos, target }
}
