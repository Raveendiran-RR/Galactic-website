import { useEffect, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { atmosphereFragment, atmosphereVertex } from '../../shaders/planet'

interface Props {
  color: string
  radius: number
  glow: MutableRefObject<number>
  base?: number
  power?: number
}

/** Fresnel rim glow. Brightens with the shared hover/focus `glow` value. */
export function Atmosphere({ color, radius, glow, base = 0.55, power = 3.2 }: Props) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uIntensity: { value: base },
          uPower: { value: power },
        },
      }),
    [color, base, power],
  )
  useEffect(() => () => material.dispose(), [material])
  useFrame(() => {
    material.uniforms.uIntensity.value = base + glow.current * 0.9
  })
  return (
    <mesh scale={radius} raycast={() => null}>
      <sphereGeometry args={[1, 40, 28]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
