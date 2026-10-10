import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { atmosphereFragment, atmosphereVertex, planetFragment, planetVertex } from '../../shaders/planet'

/** The huge "mysterious planet" the command station hangs above. */
export function BackgroundPlanet({ octaves }: { octaves: number }) {
  const { surface, atmo, geo } = useMemo(() => {
    const surface = new THREE.ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: planetFragment,
      uniforms: {
        uTime: { value: 0 },
        uStyle: { value: 0 },
        uGlow: { value: 0 },
        uColorA: { value: new THREE.Color('#0b0420') },
        uColorB: { value: new THREE.Color('#1e1a66') },
        uAccent: { value: new THREE.Color('#6f7dff') },
        uLightDir: { value: new THREE.Vector3(-0.2, 0.9, 0.5) },
        uOctaves: { value: octaves },
      },
    })
    const atmo = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color('#4f6bff') }, uIntensity: { value: 1.1 }, uPower: { value: 3.4 } },
    })
    return { surface, atmo, geo: new THREE.SphereGeometry(1, 96, 64) }
  }, [octaves])
  useEffect(
    () => () => {
      surface.dispose()
      atmo.dispose()
      geo.dispose()
    },
    [surface, atmo, geo],
  )
  useFrame(({ clock }) => {
    surface.uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <group position={[10, -158, -150]} rotation={[0.3, 0, 0.1]}>
      <mesh geometry={geo} material={surface} scale={115} raycast={() => null} />
      <mesh geometry={geo} material={atmo} scale={121} raycast={() => null} />
    </group>
  )
}
