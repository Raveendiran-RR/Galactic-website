import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { planets } from '../../data'
import { useApp } from '../../stores/useApp'
import { sfx } from '../../utils/audio'

const R = 0.5

function Marker({ index }: { index: number }) {
  const meta = planets[index]
  const hovered = useApp((s) => s.hovered === meta.id)
  const focused = useApp((s) => s.focus === meta.id)
  const setHovered = useApp((s) => s.setHovered)
  const focusPlanet = useApp((s) => s.focusPlanet)
  const core = useRef<THREE.Mesh>(null)
  useCursor(hovered)
  const t = index / (planets.length - 1)
  const x = (t - 0.5) * 1.35
  const z = -0.2 - Math.cos((t - 0.5) * Math.PI) * 0.22
  useFrame(({ clock }) => {
    if (!core.current) return
    const k = hovered || focused ? 1.9 : 1 + 0.15 * Math.sin(clock.elapsedTime * 3 + index)
    core.current.scale.setScalar(k)
  })
  return (
    <group position={[x, 0.03, z]}>
      <mesh ref={core}>
        <sphereGeometry args={[0.028, 12, 10]} />
        <meshBasicMaterial color={meta.color} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.045, 0.052, 24]} />
        <meshBasicMaterial color={meta.color} transparent opacity={hovered || focused ? 1 : 0.55} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
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
          focusPlanet(meta.id)
        }}
      >
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {hovered && (
        <Html center position={[0, 0.12, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
          <div className="map-tag" style={{ ['--c' as string]: meta.color }}>
            {meta.name}
          </div>
        </Html>
      )}
    </group>
  )
}

/** Rotating holographic spiral-galaxy navigation table. Markers are clickable. */
export function HoloMap({ pointCount }: { pointCount: number }) {
  const disc = useRef<THREE.Group>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(pointCount * 3)
    const col = new Float32Array(pointCount * 3)
    const inner = new THREE.Color('#ffffff')
    const outer = new THREE.Color('#1f8dff')
    const c = new THREE.Color()
    for (let i = 0; i < pointCount; i++) {
      const arm = i % 3
      const rr = Math.pow(Math.random(), 0.7) * R
      const th = (arm / 3) * Math.PI * 2 + rr * 7.5 + (Math.random() - 0.5) * 0.55
      pos[i * 3] = Math.cos(th) * rr
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.03 * (1 - rr / R)
      pos[i * 3 + 2] = Math.sin(th) * rr
      c.copy(inner).lerp(outer, Math.min(1, rr / R + 0.1))
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [pointCount])
  useEffect(() => () => geo.dispose(), [geo])
  const reduced = useApp((s) => s.reducedMotion)
  useFrame((_, dt) => {
    if (disc.current && !reduced) disc.current.rotation.y += dt * 0.22
  })

  return (
    <group>
      {/* emitter + light cone */}
      <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.012, 8, 40]} />
        <meshBasicMaterial color="#3cc8ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.52, 0.2, 40, 1, true]} />
        <meshBasicMaterial color="#3cc8ff" transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, 0.12, 0]} rotation={[0.5, 0, 0]}>
        <group ref={disc}>
          <points geometry={geo}>
            <pointsMaterial vertexColors size={0.011} sizeAttenuation transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        </group>
        {[0.2, 0.36, 0.52].map((r) => (
          <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r - 0.003, r + 0.003, 72]} />
            <meshBasicMaterial color="#3cc8ff" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[R + 0.05, R + 0.062, 72]} />
          <meshBasicMaterial color="#ffb547" transparent opacity={0.7} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        {planets.map((_, i) => (
          <Marker key={i} index={i} />
        ))}
      </group>
    </group>
  )
}
