import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { starFragment, starVertex } from '../../shaders/starfield'
import { fx } from '../../stores/fx'

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TUNNEL_DEPTH = 220

interface Props {
  count: number
  mode: 'tunnel' | 'shell'
  /** units per second the field drifts toward the camera (tunnel mode) */
  drift?: number
  /** multiply opacity by fx.stars (intro fade-in) */
  fadeWithIntro?: boolean
  followCamera?: boolean
  spin?: number
}

export function Starfield({ count, mode, drift = 0, fadeWithIntro = false, followCamera = false, spin = 0 }: Props) {
  const gl = useThree((s) => s.gl)
  const { geometry, material } = useMemo(() => {
    const rand = rng(mode === 'tunnel' ? 11 : 97)
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const seed = new Float32Array(count)
    const color = new Float32Array(count * 3)
    const tints = [new THREE.Color('#ffffff'), new THREE.Color('#9fd8ff'), new THREE.Color('#ffe2b0'), new THREE.Color('#c9b8ff')]
    for (let i = 0; i < count; i++) {
      if (mode === 'tunnel') {
        const a = rand() * Math.PI * 2
        const r = 3 + Math.pow(rand(), 0.75) * 70
        pos[i * 3] = Math.cos(a) * r
        pos[i * 3 + 1] = Math.sin(a) * r * 0.65
        pos[i * 3 + 2] = rand() * TUNNEL_DEPTH
      } else {
        const u = rand() * 2 - 1
        const a = rand() * Math.PI * 2
        const s = Math.sqrt(1 - u * u)
        const r = 140 + rand() * 160
        pos[i * 3] = Math.cos(a) * s * r
        pos[i * 3 + 1] = u * r
        pos[i * 3 + 2] = Math.sin(a) * s * r
      }
      size[i] = 0.7 + Math.pow(rand(), 3) * 3
      seed[i] = rand()
      const c = tints[Math.floor(rand() * rand() * tints.length)]
      const k = 0.55 + rand() * 0.45
      color[i * 3] = c.r * k
      color[i * 3 + 1] = c.g * k
      color[i * 3 + 2] = c.b * k
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    geometry.setAttribute('aColor', new THREE.BufferAttribute(color, 3))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4)
    const material = new THREE.ShaderMaterial({
      vertexShader: starVertex,
      fragmentShader: starFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uDist: { value: 0 },
        uDepth: { value: TUNNEL_DEPTH },
        uPx: { value: 1 },
        uTime: { value: 0 },
        uTunnel: { value: mode === 'tunnel' ? 1 : 0 },
        uOpacity: { value: 1 },
      },
    })
    return { geometry, material }
  }, [count, mode])

  useEffect(() => {
    material.uniforms.uPx.value = Math.min(gl.getPixelRatio(), 2)
  }, [gl, material])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  const ref = useRef<THREE.Points>(null)
  useFrame(({ camera, clock }, dt) => {
    const u = material.uniforms
    u.uTime.value = clock.elapsedTime
    if (mode === 'tunnel') u.uDist.value += dt * drift
    u.uOpacity.value = fadeWithIntro ? fx.stars : 1
    const g = ref.current
    if (g) {
      if (followCamera) g.position.copy(camera.position)
      if (spin) g.rotation.y += dt * spin
    }
  })

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />
}

