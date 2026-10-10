import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function CommandersArchive({ glow }: { glow: MutableRefObject<number> }) {
  const crystal = useRef<THREE.Mesh>(null)
  const ringA = useRef<THREE.Group>(null)
  const ringB = useRef<THREE.Group>(null)
  const glyphs = useRef<THREE.InstancedMesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const shell = useMemo(() => new THREE.IcosahedronGeometry(1.7, 0), [])
  useEffect(() => () => shell.dispose(), [shell])

  useEffect(() => {
    const m = glyphs.current
    if (!m) return
    const d = new THREE.Object3D()
    const N = 40
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      d.position.set(Math.cos(a) * 2.9, 0, Math.sin(a) * 2.9)
      d.rotation.set(0, -a, 0)
      d.scale.set(1, 0.6 + (i % 5) * 0.35, 1)
      d.updateMatrix()
      m.setMatrixAt(i, d.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(({ clock }, dt) => {
    if (crystal.current) {
      crystal.current.rotation.y += dt * 0.6
      crystal.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.12
    }
    if (ringA.current) ringA.current.rotation.y += dt * 0.22
    if (ringB.current) ringB.current.rotation.y -= dt * 0.3
    if (mat.current) mat.current.color.setScalar(0.9 + glow.current * 0.8)
  })

  return (
    <group>
      <mesh geometry={shell}>
        <meshStandardMaterial color="#1d1a14" metalness={0.7} roughness={0.55} flatShading emissive="#3a2a0c" emissiveIntensity={0.5} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[shell]} />
        <lineBasicMaterial color="#ffd37a" transparent opacity={0.8} />
      </lineSegments>
      <mesh ref={crystal}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshBasicMaterial ref={mat} color="#ffd37a" toneMapped={false} />
      </mesh>
      <group ref={ringA} rotation={[Math.PI / 2.6, 0, 0.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.9, 0.07, 8, 96]} />
          <meshStandardMaterial color="#5b4a22" metalness={0.8} roughness={0.4} />
        </mesh>
        <instancedMesh ref={glyphs} args={[undefined, undefined, 40]} frustumCulled={false}>
          <boxGeometry args={[0.07, 0.3, 0.07]} />
          <meshBasicMaterial color="#ffb547" toneMapped={false} />
        </instancedMesh>
      </group>
      <group ref={ringB} rotation={[-Math.PI / 3.2, 0, -0.3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.35, 0.05, 8, 96]} />
          <meshStandardMaterial color="#6e5a2a" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.35, 0.012, 6, 128]} />
          <meshBasicMaterial color="#ffd37a" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
