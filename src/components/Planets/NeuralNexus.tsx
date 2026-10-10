import { useEffect, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { planetFragment, planetVertex } from '../../shaders/planet'
import { useApp } from '../../stores/useApp'

const R = 2.6

const netVertex = /* glsl */ `
attribute float aT;
attribute float aSeed;
uniform float uTime;
varying float vPulse;
void main(){
  float p = fract(uTime * 0.35 + aSeed);
  vPulse = 0.25 + 1.2 * smoothstep(0.18, 0.0, abs(p - aT));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
const netFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uGlow;
varying float vPulse;
void main(){ gl_FragColor = vec4(uColor * vPulse * (1.0 + uGlow), 0.9 * min(vPulse, 1.0)); }`

const nodeVertex = /* glsl */ `
uniform float uTime;
uniform float uPx;
attribute float aSeed;
varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float pulse = 0.6 + 0.4 * sin(uTime * 2.0 + aSeed * 30.0);
  gl_PointSize = (5.0 + 5.0 * pulse) * uPx * (12.0 / -mv.z);
  vA = pulse;
}`
const nodeFragment = /* glsl */ `
uniform vec3 uColor;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d);
  gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.5) * vA, a);
}`

export function NeuralNexus({ glow }: { glow: MutableRefObject<number> }) {
  const quality = useApp((s) => s.quality)
  const { body, lines, nodes, nets } = useMemo(() => {
    const seg = quality === 'low' ? [32, 24] : [64, 48]
    const body = new THREE.SphereGeometry(R, seg[0], seg[1])
    const N = quality === 'low' ? 34 : 56
    const pts: THREE.Vector3[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(R * 1.16))
    }
    const lp: number[] = []
    const lt: number[] = []
    const ls: number[] = []
    const maxD = R * 1.16 * 0.78
    for (let i = 0; i < N; i++) {
      let links = 0
      for (let j = i + 1; j < N && links < 3; j++) {
        if (pts[i].distanceTo(pts[j]) < maxD) {
          const seed = Math.random()
          // arc the edge outward so it hugs the sphere
          const mid = pts[i].clone().add(pts[j]).multiplyScalar(0.5).setLength(R * 1.2)
          const curve = new THREE.QuadraticBezierCurve3(pts[i], mid, pts[j])
          const sub = curve.getPoints(8)
          for (let k = 0; k < sub.length - 1; k++) {
            lp.push(sub[k].x, sub[k].y, sub[k].z, sub[k + 1].x, sub[k + 1].y, sub[k + 1].z)
            lt.push(k / 8, (k + 1) / 8)
            ls.push(seed, seed)
          }
          links++
        }
      }
    }
    const lines = new THREE.BufferGeometry()
    lines.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3))
    lines.setAttribute('aT', new THREE.Float32BufferAttribute(lt, 1))
    lines.setAttribute('aSeed', new THREE.Float32BufferAttribute(ls, 1))
    const nodes = new THREE.BufferGeometry()
    nodes.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap((p) => [p.x, p.y, p.z]), 3))
    nodes.setAttribute('aSeed', new THREE.Float32BufferAttribute(pts.map(() => Math.random()), 1))

    const accent = new THREE.Color('#3cc8ff')
    const surface = new THREE.ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: planetFragment,
      uniforms: {
        uTime: { value: 0 },
        uStyle: { value: 0 },
        uGlow: { value: 0 },
        uColorA: { value: new THREE.Color('#050f26') },
        uColorB: { value: new THREE.Color('#0d3c78') },
        uAccent: { value: accent },
        uLightDir: { value: new THREE.Vector3(-0.6, 0.45, 0.8) },
        uOctaves: { value: quality === 'low' ? 2 : 4 },
      },
    })
    const lineMat = new THREE.ShaderMaterial({
      vertexShader: netVertex,
      fragmentShader: netFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uColor: { value: accent }, uGlow: { value: 0 } },
    })
    const nodeMat = new THREE.ShaderMaterial({
      vertexShader: nodeVertex,
      fragmentShader: nodeFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uColor: { value: accent }, uPx: { value: Math.min(window.devicePixelRatio, 2) } },
    })
    return { body, lines, nodes, nets: { surface, lineMat, nodeMat } }
  }, [quality])

  useEffect(
    () => () => {
      body.dispose()
      lines.dispose()
      nodes.dispose()
      nets.surface.dispose()
      nets.lineMat.dispose()
      nets.nodeMat.dispose()
    },
    [body, lines, nodes, nets],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    nets.surface.uniforms.uTime.value = t
    nets.surface.uniforms.uGlow.value = glow.current
    nets.lineMat.uniforms.uTime.value = t
    nets.lineMat.uniforms.uGlow.value = glow.current
    nets.nodeMat.uniforms.uTime.value = t
  })

  return (
    <group>
      <mesh geometry={body} material={nets.surface} />
      <lineSegments geometry={lines} material={nets.lineMat} />
      <points geometry={nodes} material={nets.nodeMat} />
    </group>
  )
}
