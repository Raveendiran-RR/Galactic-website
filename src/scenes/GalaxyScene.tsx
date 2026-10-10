import type { ReactNode, MutableRefObject } from 'react'
import { Environment, Lightformer, Sparkles } from '@react-three/drei'
import { planets, type PlanetId } from '../data'
import { qualityConfig, type Quality } from '../utils/quality'
import { Starfield } from '../components/Galaxy/Starfield'
import { Nebula } from '../components/Galaxy/Nebula'
import { BackgroundPlanet } from '../components/Galaxy/BackgroundPlanet'
import { SpaceStation } from '../components/Galaxy/SpaceStation'
import { PlanetNode } from '../components/Planets/PlanetNode'
import { NeuralNexus } from '../components/Planets/NeuralNexus'
import { ContainerPrime } from '../components/Planets/ContainerPrime'
import { ArchitectsForge } from '../components/Planets/ArchitectsForge'
import { ProjectNebula } from '../components/Planets/ProjectNebula'
import { BroadcastStation } from '../components/Planets/BroadcastStation'
import { CommandersArchive } from '../components/Planets/CommandersArchive'
import { useApp } from '../stores/useApp'

type Body = (props: { glow: MutableRefObject<number> }) => ReactNode

const BODIES: Record<PlanetId, Body> = {
  'neural-nexus': NeuralNexus,
  'container-prime': ContainerPrime,
  'architects-forge': ArchitectsForge,
  'project-nebula': ProjectNebula,
  'broadcast-station': BroadcastStation,
  'commanders-archive': CommandersArchive,
}

export function GalaxyScene({ quality }: { quality: Quality }) {
  const cfg = qualityConfig(quality)
  const reduced = useApp((s) => s.reducedMotion)
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[-10, 8, 14]} intensity={2.4} color="#fff1e0" />
      <pointLight position={[0, 4, 6]} intensity={40} distance={60} color="#3cc8ff" />
      <pointLight position={[18, -3, -2]} intensity={30} distance={60} color="#ffb547" />
      {quality !== 'low' && (
        <Environment resolution={64} frames={1} background={false}>
          <Lightformer form="rect" intensity={2.5} color="#3cc8ff" position={[-8, 3, 4]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={2} color="#ffb547" position={[8, 2, 4]} scale={[8, 3, 1]} />
          <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 8, -4]} scale={6} />
        </Environment>
      )}
      {cfg.nebula && <Nebula octaves={cfg.nebulaOctaves} strength={0.5} />}
      <Starfield count={cfg.shellStars} mode="shell" followCamera spin={reduced ? 0 : 0.0025} />
      <BackgroundPlanet octaves={cfg.nebulaOctaves} />
      <SpaceStation />
      <Sparkles count={cfg.dust} scale={[70, 24, 50]} position={[0, 0, -4]} size={2.2} speed={reduced ? 0 : 0.25} opacity={0.5} color="#9fd8ff" />
      {planets.map((meta, i) => {
        const Body = BODIES[meta.id]
        return (
          <PlanetNode key={meta.id} meta={meta} index={i}>
            {(glow) => <Body glow={glow} />}
          </PlanetNode>
        )
      })}
    </>
  )
}
