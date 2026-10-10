import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { planetFragment, planetVertex } from '../../shaders/planet'
import { useApp } from '../../stores/useApp'

const R = 2.2

export function ContainerPrime({ glow }: { glow: MutableRefObject<number> }) {
  const quality = useApp((s) => s.quality)
  const ring = useRef<THREE.Group>(null)
  const boxes = useRef<THREE.InstancedMesh>(null)

  const { surface, body } = useMemo(() => {
    const surface = new THREE.ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: planetFragment,
      uniforms: {
        uTime: { value: 0 },
        uStyle: { value: 1 },
        uGlow: { value: 0 },
        uColorA: { value: new THREE.Color('#2a2f3a') },
        uColorB: { value: new THREE.Color('#8a5326') },
        uAccent: { value: new THREE.Color('#ffb547') },
        uLightDir: { value: new THREE.Vector3(-0.6, 0.4, 0.8) },
        uOctaves: { value: quality === 'low' ? 2 : 4 },
      },
    })
    const body = new THREE.SphereGeometry(R, quality === 'low' ? 32 : 64, quality === 'low' ? 24 : 48)
    return { surface, body }
  }, [quality])

  useEffect(
    () => () => {
      surface.dispose()
      body.dispose()
    },
    [surface, body],
  )

  const COUNT = quality === 'low' ? 36 : 72
  useEffect(() => {
    const m = boxes.current
    if (!m) return
    const dummy = new THREE.Object3D()
    const c = new THREE.Color()
    const palette = ['#c9822f', '#d9d4c7', '#5b7da8', '#b04a2e', '#3d4650']
    for (let i = 0; i < COUNT; i++) {
      const a = (i / COUNT) * Math.PI * 2
      const r = 3.45 + (i % 3) * 0.12
      dummy.position.set(Math.cos(a) * r, ((i * 7) % 5) * 0.05 - 0.1, Math.sin(a) * r)
      dummy.rotation.set(0, -a, 0)
      dummy.scale.set(1 + (i % 4) * 0.35, 1, 1)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, c.set(palette[i % palette.length]))
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [COUNT])

  useFrame(({ clock }, dt) => {
    surface.uniforms.uTime.value = clock.elapsedTime
    surface.uniforms.uGlow.value = glow.current
    if (ring.current) ring.current.rotation.y -= dt * 0.18
  })

  return (
    <group>
      <mesh geometry={body} material={surface} />
      <group rotation={[0.38, 0, 0.18]}>
        <group ref={ring}>
          <instancedMesh ref={boxes} args={[undefined, undefined, COUNT]} frustumCulled={false}>
            <boxGeometry args={[0.34, 0.16, 0.16]} />
            <meshStandardMaterial metalness={0.6} roughness={0.45} />
          </instancedMesh>
          {[0, 1, 2].map((k) => {
            const a = (k / 3) * Math.PI * 2 + 0.5
            return (
              <group key={k} position={[Math.cos(a) * 3.55, 0, Math.sin(a) * 3.55]} rotation={[0, -a, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.16, 0.16, 0.7, 12]} />
                  <meshStandardMaterial color="#9aa4b4" metalness={0.8} roughness={0.35} />
                </mesh>
                <mesh position={[0, 0.42, 0]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshBasicMaterial color="#ffb547" toneMapped={false} />
                </mesh>
              </group>
            )
          })}
        </group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.5, 0.012, 6, 128]} />
          <meshBasicMaterial color="#ffb547" transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  )
}
