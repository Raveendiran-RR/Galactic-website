import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const metal = { color: '#27344d', metalness: 0.85, roughness: 0.38 }

export function ArchitectsForge({ glow }: { glow: MutableRefObject<number> }) {
  const ringA = useRef<THREE.Group>(null)
  const ringB = useRef<THREE.Group>(null)
  const core = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }, dt) => {
    if (ringA.current) ringA.current.rotation.y += dt * 0.28
    if (ringB.current) ringB.current.rotation.y -= dt * 0.18
    if (core.current) core.current.color.setScalar(0.8 + 0.2 * Math.sin(clock.elapsedTime * 2) + glow.current * 0.5)
  })

  return (
    <group rotation={[0.35, 0, 0.12]}>
      {/* central spine */}
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 4.6, 16]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.55, 0.8, 16]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, -2.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.55, 0.8, 16]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {/* forge core */}
      <mesh>
        <sphereGeometry args={[0.9, 24, 18]} />
        <meshBasicMaterial ref={core} color="#9fd0ff" toneMapped={false} />
      </mesh>
      {/* inner habitat ring + spokes */}
      <group ref={ringA}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.1, 0.2, 12, 64]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.1, 0.035, 6, 96]} />
          <meshBasicMaterial color="#7aa8ff" toneMapped={false} />
        </mesh>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} rotation={[0, (k * Math.PI) / 2, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[4.2, 0.07, 0.07]} />
            <meshStandardMaterial {...metal} />
          </mesh>
        ))}
      </group>
      {/* outer gantry ring with solar vanes */}
      <group ref={ringB} rotation={[0.5, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.3, 0.1, 8, 96]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.3, 0.02, 6, 128]} />
          <meshBasicMaterial color="#ffb547" toneMapped={false} />
        </mesh>
        {Array.from({ length: 8 }).map((_, k) => {
          const a = (k / 8) * Math.PI * 2
          return (
            <mesh key={k} position={[Math.cos(a) * 3.3, 0, Math.sin(a) * 3.3]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.1, 0.9, 0.5]} />
              <meshStandardMaterial color="#1b3a66" metalness={0.5} roughness={0.3} emissive="#10305a" emissiveIntensity={0.6} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
