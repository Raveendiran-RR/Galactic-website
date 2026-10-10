import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { atmosphereFragment, atmosphereVertex } from '../../shaders/planet'
import { useApp } from '../../stores/useApp'
import { sfx } from '../../utils/audio'

/** RAVI-AI: floating energy orb with orbiting rings and electric-blue particles. */
export function AssistantOrb({ particles = 90 }: { particles?: number }) {
  const core = useRef<THREE.Mesh>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const ringC = useRef<THREE.Mesh>(null)
  const swarm = useRef<THREE.Points>(null)
  const open = useApp((s) => s.tool === 'assistant')
  const setTool = useApp((s) => s.setTool)
  const hoverRef = useRef(false)
  const labelRef = useRef<HTMLDivElement>(null)

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const p = new Float32Array(particles * 3)
    for (let i = 0; i < particles; i++) {
      const r = 0.2 + Math.random() * 0.14
      const a = Math.random() * Math.PI * 2
      const u = Math.random() * 2 - 1
      const s = Math.sqrt(1 - u * u)
      p[i * 3] = Math.cos(a) * s * r
      p[i * 3 + 1] = u * r
      p[i * 3 + 2] = Math.sin(a) * s * r
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [particles])
  const haloMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color('#3cc8ff') }, uIntensity: { value: 1.2 }, uPower: { value: 2.2 } },
      }),
    [],
  )
  useEffect(
    () => () => {
      geo.dispose()
      haloMat.dispose()
    },
    [geo, haloMat],
  )

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const speed = open ? 3.4 : 1.6
    const pulse = 1 + 0.12 * Math.sin(t * speed * 1.6) + (hoverRef.current ? 0.15 : 0)
    core.current?.scale.setScalar(pulse)
    haloMat.uniforms.uIntensity.value = (open ? 1.8 : 1.1) + 0.5 * Math.sin(t * speed * 1.6)
    if (ringA.current) ringA.current.rotation.x += dt * 0.9
    if (ringB.current) ringB.current.rotation.y += dt * 1.2
    if (ringC.current) ringC.current.rotation.z -= dt * 0.7
    if (swarm.current) {
      swarm.current.rotation.y += dt * 0.6
      swarm.current.rotation.x += dt * 0.2
    }
  })

  return (
    <group>
      <mesh ref={core}>
        <sphereGeometry args={[0.1, 24, 18]} />
        <meshBasicMaterial color="#bfeaff" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.2, 24, 18]} />
        <primitive object={haloMat} attach="material" />
      </mesh>
      <mesh ref={ringA} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.2, 0.004, 6, 64]} />
        <meshBasicMaterial color="#3cc8ff" toneMapped={false} />
      </mesh>
      <mesh ref={ringB} rotation={[0, 0.5, 1.1]}>
        <torusGeometry args={[0.25, 0.004, 6, 64]} />
        <meshBasicMaterial color="#8fdcff" toneMapped={false} />
      </mesh>
      <mesh ref={ringC} rotation={[1.2, 0.3, 0]}>
        <torusGeometry args={[0.3, 0.003, 6, 64]} />
        <meshBasicMaterial color="#ffb547" toneMapped={false} />
      </mesh>
      <points ref={swarm} geometry={geo}>
        <pointsMaterial color="#7fdcff" size={0.012} sizeAttenuation transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          hoverRef.current = true
          document.body.style.cursor = 'pointer'
          if (labelRef.current) labelRef.current.style.opacity = '1'
          sfx.hover()
        }}
        onPointerOut={() => {
          hoverRef.current = false
          document.body.style.cursor = ''
          if (labelRef.current) labelRef.current.style.opacity = '0'
        }}
        onClick={(e) => {
          e.stopPropagation()
          sfx.click()
          setTool(open ? null : 'assistant')
        }}
      >
        <sphereGeometry args={[0.36, 12, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      <Html center position={[0, -0.42, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
        <div ref={labelRef} className="map-tag" style={{ opacity: 0, ['--c' as string]: '#3cc8ff' }}>
          RAVI-AI
        </div>
      </Html>
    </group>
  )
}
