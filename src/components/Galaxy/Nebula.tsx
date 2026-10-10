import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { nebulaFragment, nebulaVertex } from '../../shaders/planet'

interface Props {
  octaves: number
  strength?: number
  colorA?: string
  colorB?: string
}

/** Procedural nebula painted on the inside of a huge sphere that follows the camera. */
export function Nebula({ octaves, strength = 0.55, colorA = '#1b4dff', colorB = '#a02bff' }: Props) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: nebulaVertex,
        fragmentShader: nebulaFragment,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color(colorA) },
          uColorB: { value: new THREE.Color(colorB) },
          uStrength: { value: strength },
          uOctaves: { value: octaves },
        },
      }),
    [octaves, strength, colorA, colorB],
  )
  useEffect(() => () => material.dispose(), [material])
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ camera, clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime
    ref.current?.position.copy(camera.position)
  })
  return (
    <mesh ref={ref} renderOrder={-100} frustumCulled={false}>
      <sphereGeometry args={[480, 32, 24]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
