import { useEffect, useRef, type ReactNode, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { useApp } from '../../stores/useApp'
import { fx } from '../../stores/fx'
import { PLANET_POS, PLANET_RADIUS } from '../../utils/layout'
import { sfx } from '../../utils/audio'
import type { PlanetMeta } from '../../data'
import { Atmosphere } from './Atmosphere'

interface Props {
  meta: PlanetMeta
  index: number
  children: (glow: MutableRefObject<number>) => ReactNode
}

const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt))

/** Shared wrapper: placement, hover glow, label, click-to-focus, spin-into-view. */
export function PlanetNode({ meta, index, children }: Props) {
  const group = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const glow = useRef(0)
  const hovered = useApp((s) => s.hovered === meta.id)
  const focused = useApp((s) => s.focus === meta.id)
  const reduced = useApp((s) => s.reducedMotion)
  const setHovered = useApp((s) => s.setHovered)
  const focusPlanet = useApp((s) => s.focusPlanet)
  const radius = PLANET_RADIUS[meta.id]
  useCursor(hovered)

  // rotate the world into view when it becomes the focus
  useEffect(() => {
    if (!focused || !spin.current || reduced) return
    const tween = gsap.to(spin.current.rotation, { y: '+=1.6', duration: 1.8, ease: 'power3.out' })
    return () => {
      tween.kill()
    }
  }, [focused, reduced])

  useFrame((_, dt) => {
    const g = group.current
    const s = spin.current
    if (!g || !s) return
    const target = focused ? 0.85 : hovered ? 1 : 0
    glow.current = damp(glow.current, target, 7, dt)
    const t = THREE.MathUtils.clamp((fx.reveal - index * 0.07) / 0.6, 0, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    g.scale.setScalar(Math.max(0.0001, eased))
    g.visible = t > 0
    if (!reduced) s.rotation.y += dt * (focused ? 0.05 : 0.11)
    g.position.y = PLANET_POS[meta.id].y + (reduced ? 0 : Math.sin(performance.now() * 0.0004 + index * 1.7) * 0.18)
  })

  const pos = PLANET_POS[meta.id]
  return (
    <group ref={group} position={pos}>
      <group ref={spin}>{children(glow)}</group>
      <Atmosphere color={meta.color} radius={radius * 1.14} glow={glow} base={0.12} power={6} />
      {/* generous invisible hit-area so small / sparse models are easy to hit */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(meta.id)
          sfx.hover()
        }}
        onPointerOut={() => setHovered(null)}
        onClick={(e) => {
          e.stopPropagation()
          sfx.click()
          sfx.holo()
          focusPlanet(meta.id)
        }}
      >
        <sphereGeometry args={[radius * 1.25, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {hovered && !focused && (
        <Html position={[0, radius * 1.45, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="planet-label" style={{ ['--c' as string]: meta.color }}>
            <strong>{meta.name}</strong>
            <span>{meta.category}</span>
            <em>{meta.description}</em>
          </div>
        </Html>
      )}
    </group>
  )
}
