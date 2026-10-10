import { useMemo, useRef, useEffect, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Sat {
  r: number
  speed: number
  phase: number
  tilt: number
  size: number
}

const SATS: Sat[] = Array.from({ length: 7 }, (_, i) => ({
  r: 1.9 + (i % 3) * 0.75,
  speed: 0.32 - i * 0.025,
  phase: (i / 7) * Math.PI * 2,
  tilt: (i - 3) * 0.16,
  size: 0.26 + (i % 2) * 0.08,
}))

const CARD_EDGES = new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.7, 0.45))

function Satellite({ s }: { s: Sat }) {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const a = s.phase + clock.elapsedTime * s.speed
    g.current?.position.set(Math.cos(a) * s.r, Math.sin(a * 0.7) * s.tilt * s.r, Math.sin(a) * s.r)
    if (g.current) g.current.rotation.y = -a
  })
  return (
    <group ref={g}>
      <mesh>
        <octahedronGeometry args={[s.size, 0]} />
        <meshStandardMaterial color="#2b2547" metalness={0.8} roughness={0.3} emissive="#6b3fd0" emissiveIntensity={0.6} />
      </mesh>
      {/* holographic card */}
      <mesh position={[0, 0, s.size * 1.9]}>
        <planeGeometry args={[0.7, 0.45]} />
        <meshBasicMaterial color="#b78bff" transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <lineSegments position={[0, 0, s.size * 1.9]}>
        <primitive object={CARD_EDGES} attach="geometry" />
        <lineBasicMaterial color="#d9c4ff" transparent opacity={0.9} />
      </lineSegments>
    </group>
  )
}

export function ProjectNebula({ glow }: { glow: MutableRefObject<number> }) {
  const core = useRef<THREE.Mesh>(null)
  const dust = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const n = 260
    const p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 0.8 + Math.random() * 3.2
      const a = Math.random() * Math.PI * 2
      const u = Math.random() * 2 - 1
      const s = Math.sqrt(1 - u * u)
      p[i * 3] = Math.cos(a) * s * r
      p[i * 3 + 1] = u * r * 0.6
      p[i * 3 + 2] = Math.sin(a) * s * r
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [])
  useEffect(() => () => dust.dispose(), [dust])
  useFrame(({ clock }) => {
    if (core.current) core.current.scale.setScalar(1 + 0.08 * Math.sin(clock.elapsedTime * 2.2) + glow.current * 0.2)
  })
  return (
    <group scale={1.3}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.75, 1]} />
        <meshBasicMaterial color="#b78bff" wireframe toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.45, 16, 12]} />
        <meshBasicMaterial color="#e6d6ff" toneMapped={false} />
      </mesh>
      {SATS.map((s, i) => (
        <Satellite key={i} s={s} />
      ))}
      <points geometry={dust}>
        <pointsMaterial color="#c4a3ff" size={0.05} sizeAttenuation transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}
