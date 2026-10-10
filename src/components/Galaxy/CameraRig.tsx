import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { useApp } from '../../stores/useApp'
import { fx } from '../../stores/fx'
import { focusPose, homePose, isCompact } from '../../utils/layout'
import type { PlanetId } from '../../data'

const BASE_FOV = 55
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt))

/**
 * Owns the camera. GSAP tweens `rig.pos` / `rig.target`; useFrame applies them
 * plus parallax, hyperspace shake and FOV punch. Switching planets always routes
 * through the home pose so the camera never cuts through a neighbouring world.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const phase = useApp((s) => s.phase)
  const focus = useApp((s) => s.focus)
  const browse = useApp((s) => s.browse)
  const reduced = useApp((s) => s.reducedMotion)
  const compact = isCompact(size.width, size.height)

  const rig = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3(0, 0, -10) })
  const arrived = useRef(false)
  const prevFocus = useRef<PlanetId | null>(null)
  const par = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const r = rig.current
    if (phase !== 'galaxy') {
      arrived.current = false
      prevFocus.current = null
      r.pos.set(0, 0, 0)
      r.target.set(0, 0, -10)
      return
    }
    const home = homePose(compact, browse)
    const goal = focus ? focusPose(focus, compact, size.width, size.height) : home
    const tl = gsap.timeline()
    const move = (pose: { pos: THREE.Vector3; target: THREE.Vector3 }, dur: number, ease: string, at: number | string = '>') => {
      const d = reduced ? 0.01 : dur
      tl.to(r.pos, { x: pose.pos.x, y: pose.pos.y, z: pose.pos.z, duration: d, ease }, at)
      tl.to(r.target, { x: pose.target.x, y: pose.target.y, z: pose.target.z, duration: d, ease }, '<')
    }
    if (!arrived.current) {
      arrived.current = true
      r.pos.set(home.pos.x, home.pos.y + 1.5, home.pos.z + 34)
      r.target.set(0, 0, -10)
      move(goal, 2.4, 'power3.out', 0)
    } else if (focus && prevFocus.current && prevFocus.current !== focus) {
      move(home, 0.9, 'power2.inOut', 0)
      move(goal, 1.7, 'power3.inOut')
    } else {
      move(goal, focus ? 2.0 : 1.5, 'power3.inOut', 0)
    }
    prevFocus.current = focus
    return () => {
      tl.kill()
    }
  }, [phase, focus, browse, compact, size.width, size.height, reduced])

  useFrame((state, dt) => {
    const r = rig.current
    const t = state.clock.elapsedTime
    if (phase === 'intro' && !reduced) r.target.set(Math.sin(t * 0.12) * 1.6, Math.sin(t * 0.09) * 0.8, -10)

    let px = 0
    let py = 0
    if (phase === 'galaxy' && !reduced) {
      par.current.x = damp(par.current.x, state.pointer.x, 3, dt)
      par.current.y = damp(par.current.y, state.pointer.y, 3, dt)
      const k = focus ? 0.35 : 1
      px = par.current.x * 0.5 * k
      py = par.current.y * 0.28 * k
    }
    camera.position.set(r.pos.x + px, r.pos.y + py, r.pos.z)
    camera.lookAt(r.target)

    if (fx.shake > 0.001 && !reduced) {
      const s = fx.shake
      camera.position.x += Math.sin(t * 61) * 0.05 * s
      camera.position.y += Math.cos(t * 53) * 0.05 * s
      camera.rotateZ(Math.sin(t * 37) * 0.012 * s)
    }
    const fov = BASE_FOV + fx.fovBoost
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  })
  return null
}
