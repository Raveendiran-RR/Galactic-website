import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { streakFragment, streakVertex } from '../shaders/starfield'
import { fx } from '../stores/fx'

const DEPTH = 160

/** Thousands of light streaks drawn with ONE instanced draw call; all motion runs in the vertex shader. */
export function HyperspaceScene({ count }: { count: number }) {
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.InstancedBufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0]), 3))
    geometry.setIndex([0, 1, 2, 0, 2, 3])
    const offsets = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 1.2 + Math.pow(Math.random(), 0.6) * 38
      offsets[i * 3] = Math.cos(a) * r
      offsets[i * 3 + 1] = Math.sin(a) * r * 0.7
      offsets[i * 3 + 2] = Math.random()
      seeds[i] = Math.random()
    }
    geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3))
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    geometry.instanceCount = count
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4)
    const material = new THREE.ShaderMaterial({
      vertexShader: streakVertex,
      fragmentShader: streakFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uDist: { value: 0 },
        uDepth: { value: DEPTH },
        uSpeed: { value: 0 },
        uLen: { value: 26 },
        uAspect: { value: 1.6 },
        uWidth: { value: 0.0026 },
      },
    })
    return { geometry, material }
  }, [count])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame(({ size }, dt) => {
    fx.dist += dt * (4 + fx.speed * 300)
    const u = material.uniforms
    u.uDist.value = fx.dist
    u.uSpeed.value = fx.speed
    u.uAspect.value = size.width / size.height
  })

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />
}
