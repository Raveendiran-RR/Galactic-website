import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const metal = { color: '#2a3b44', metalness: 0.85, roughness: 0.35 }
const WAVES = 3

export function BroadcastStation({ glow }: { glow: MutableRefObject<number> }) {
  const dish = useRef<THREE.Group>(null)
  const waves = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }, dt) => {
    if (dish.current) dish.current.rotation.y += dt * 0.15
    const t = clock.elapsedTime
    waves.current.forEach((m, i) => {
      if (!m) return
      const p = (t * 0.35 + i / WAVES) % 1
      m.scale.setScalar(0.6 + p * 3.4)
      ;(m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * (0.45 + glow.current * 0.4)
    })
  })

  return (
    <group rotation={[0.25, 0, -0.18]}>
      <mesh>
        <cylinderGeometry args={[0.18, 0.28, 4.4, 12]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.75, 20, 16]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.78, 0.03, 6, 48]} />
        <meshBasicMaterial color="#5affc4" toneMapped={false} />
      </mesh>
      <group ref={dish} position={[0, 1.7, 0]} rotation={[-0.6, 0, 0]}>
        {/* main dish */}
        <mesh rotation={[Math.PI, 0, 0]} position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.9, 32, 12, 0, Math.PI * 2, 0, 0.62]} />
          <meshStandardMaterial {...metal} side={THREE.DoubleSide} emissive="#0a2a28" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.6, 6]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#5affc4" toneMapped={false} />
        </mesh>
      </group>
      {/* secondary dishes */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.4, -1.3, 0]} rotation={[0.5, 0, s * 0.6]}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.75, 20, 10, 0, Math.PI * 2, 0, 0.7]} />
            <meshStandardMaterial {...metal} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {[-0.6, 0, 0.6].map((x) => (
        <mesh key={x} position={[x, -2.4, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.4, 5]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}
      {/* transmission pulses */}
      <group position={[0, 1.7, 0]} rotation={[-0.6, 0, 0]}>
        {Array.from({ length: WAVES }).map((_, i) => (
          <mesh
            key={i}
            ref={(m) => {
              waves.current[i] = m
            }}
            position={[0, 1, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.95, 1, 48]} />
            <meshBasicMaterial color="#5affc4" transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
