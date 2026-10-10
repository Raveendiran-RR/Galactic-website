import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { fx } from '../../stores/fx'
import { qualityConfig } from '../../utils/quality'
import { isCompact } from '../../utils/layout'
import { useApp } from '../../stores/useApp'
import { makePanelTexture } from './panelTexture'
import { HoloMap } from './HoloMap'
import { AssistantOrb } from './AssistantOrb'

const D = 1.7 // depth of the cockpit shell in front of the camera
const HALF_H = D * Math.tan((55 / 2) * (Math.PI / 180))

const hull = { color: '#0a1220', metalness: 0.85, roughness: 0.42 }

/** First-person cockpit: window frame, dashboard, readout panels, holo map and RAVI-AI orb. Lives in camera space. */
export function Cockpit() {
  const size = useThree((s) => s.size)
  const quality = useApp((s) => s.quality)
  const cfg = qualityConfig(quality)
  const aspect = size.width / size.height
  const compact = isCompact(size.width, size.height)
  const halfW = HALF_H * aspect
  const group = useRef<THREE.Group>(null)
  const lights = useRef<THREE.InstancedMesh>(null)

  const panels = useMemo(() => [makePanelTexture(3, '#3cc8ff'), makePanelTexture(8, '#ffb547'), makePanelTexture(15, '#3cc8ff')], [])
  useEffect(
    () => () => {
      panels.forEach((t) => t.dispose())
    },
    [panels],
  )

  const BUTTONS = 46
  useEffect(() => {
    const m = lights.current
    if (!m) return
    const d = new THREE.Object3D()
    const c = new THREE.Color()
    const cols = ['#3cc8ff', '#ffb547', '#ffffff', '#3cc8ff', '#5affc4']
    for (let i = 0; i < BUTTONS; i++) {
      d.position.set(((i % 23) / 22 - 0.5) * (halfW * 1.35), 0.01, Math.floor(i / 23) * 0.09 + 0.04)
      d.scale.set(1, 1, 1)
      d.updateMatrix()
      m.setMatrixAt(i, d.matrix)
      m.setColorAt(i, c.set(cols[i % cols.length]).multiplyScalar(0.8))
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [halfW])

  useFrame(() => {
    const g = group.current
    if (!g) return
    const k = 1 - Math.pow(1 - Math.min(1, fx.reveal * 1.4), 3)
    g.position.y = -(1 - k) * 1.4
  })

  const dashY = -HALF_H + 0.06
  const pillarX = halfW - 0.02

  return (
    <group ref={group}>
      {/* window frame */}
      <mesh position={[0, HALF_H - 0.03, -D]}>
        <boxGeometry args={[halfW * 2 + 0.6, 0.16, 0.25]} />
        <meshStandardMaterial {...hull} />
      </mesh>
      <mesh position={[0, HALF_H - 0.115, -D + 0.1]}>
        <boxGeometry args={[halfW * 1.6, 0.012, 0.01]} />
        <meshBasicMaterial color="#3cc8ff" toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * pillarX, 0, -D]} rotation={[0, 0, -s * 0.05]}>
          <mesh>
            <boxGeometry args={[0.13, HALF_H * 2 + 0.8, 0.2]} />
            <meshStandardMaterial {...hull} />
          </mesh>
          <mesh position={[-s * 0.112, 0, 0.1]}>
            <boxGeometry args={[0.012, HALF_H * 1.7, 0.01]} />
            <meshBasicMaterial color={s < 0 ? '#3cc8ff' : '#ffb547'} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* dashboard slab, tilted toward the pilot */}
      <group position={[0, dashY, -D - 0.1]} rotation={[0.42, 0, 0]}>
        <mesh>
          <boxGeometry args={[halfW * 2 + 0.8, 0.34, 0.95]} />
          <meshStandardMaterial {...hull} />
        </mesh>
        <mesh position={[0, 0.172, 0.46]}>
          <boxGeometry args={[halfW * 2 + 0.6, 0.012, 0.012]} />
          <meshBasicMaterial color="#3cc8ff" toneMapped={false} />
        </mesh>
        {!compact && (
          <>
            {[-1, 1].map((s, i) => (
              <mesh key={s} position={[s * halfW * 0.62, 0.176, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[Math.min(1.1, halfW * 0.5), 0.55]} />
                <meshBasicMaterial map={panels[i]} toneMapped={false} transparent opacity={0.95} />
              </mesh>
            ))}
            <mesh position={[0, 0.176, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.9, 0.22]} />
              <meshBasicMaterial map={panels[2]} toneMapped={false} transparent opacity={0.9} />
            </mesh>
            {cfg.cockpitDetail && (
              <instancedMesh ref={lights} args={[undefined, undefined, BUTTONS]} position={[0, 0.172, 0.12]} frustumCulled={false}>
                <boxGeometry args={[0.03, 0.012, 0.03]} />
                <meshBasicMaterial toneMapped={false} />
              </instancedMesh>
            )}
          </>
        )}
      </group>

      {/* holographic galaxy map */}
      {!compact && (
        <group position={[0, -HALF_H + 0.2, -D - 0.12]} scale={0.62}>
          <HoloMap pointCount={cfg.holoPoints} />
        </group>
      )}

      {/* RAVI-AI */}
      <group position={compact ? [halfW * 0.55, -0.42, -D + 0.1] : [-(halfW - 0.75), -HALF_H + 0.5, -D + 0.1]} scale={compact ? 0.4 : 0.65}>
        <AssistantOrb particles={cfg.cockpitDetail ? 90 : 40} />
      </group>
    </group>
  )
}
