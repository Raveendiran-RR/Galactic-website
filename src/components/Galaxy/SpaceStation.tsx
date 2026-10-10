import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const hull = { color: '#1b2438', metalness: 0.8, roughness: 0.5 }

/** Distant command station: spinning habitat ring on a long truss, blinking beacons. */
export function SpaceStation() {
  const ring = useRef<THREE.Group>(null)
  const beacons = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }, dt) => {
    if (ring.current) ring.current.rotation.z += dt * 0.05
    beacons.current.forEach((m, i) => {
      if (m) (m.material as THREE.MeshBasicMaterial).color.setScalar(0.3 + 0.7 * (Math.sin(clock.elapsedTime * 2 + i * 1.9) > 0.4 ? 1 : 0.1))
    })
  })
  return (
    <group position={[46, 24, -170]} rotation={[0.2, -0.5, 0.1]} scale={1.5}>
      <mesh>
        <boxGeometry args={[60, 1.6, 1.6]} />
        <meshStandardMaterial {...hull} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[3, 3, 10, 16]} />
        <meshStandardMaterial {...hull} />
      </mesh>
      <group ref={ring} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <torusGeometry args={[14, 1.2, 10, 64]} />
          <meshStandardMaterial {...hull} />
        </mesh>
        <mesh>
          <torusGeometry args={[14, 0.12, 6, 96]} />
          <meshBasicMaterial color="#ffb547" toneMapped={false} />
        </mesh>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} rotation={[0, 0, (k * Math.PI) / 2]}>
            <boxGeometry args={[28, 0.3, 0.3]} />
            <meshStandardMaterial {...hull} />
          </mesh>
        ))}
      </group>
      {[-24, -12, 12, 24].map((x) => (
        <mesh key={x} position={[x, 4.2, 0]}>
          <boxGeometry args={[6, 0.12, 5]} />
          <meshStandardMaterial color="#12305a" metalness={0.4} roughness={0.35} emissive="#0c2a55" emissiveIntensity={0.6} />
        </mesh>
      )).concat(
        [-29, 29].map((x, i) => (
          <mesh
            key={`b${x}`}
            position={[x, 0, 0]}
            ref={(m) => {
              beacons.current[i] = m
            }}
          >
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color="#ff5a3c" toneMapped={false} />
          </mesh>
        )),
      )}
    </group>
  )
}
