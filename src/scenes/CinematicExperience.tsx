import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, PerspectiveCamera } from '@react-three/drei'
import { useApp } from '../stores/useApp'
import { qualityConfig } from '../utils/quality'
import { introAlreadyHandled, resetDirector, skipIntro } from '../utils/director'
import { ErrorBoundary } from '../components/UI/ErrorBoundary'
import { IntroOverlay } from '../components/Intro/IntroOverlay'
import { WarpFlash } from '../components/Intro/WarpFlash'
import { Hud } from '../components/Navigation/Hud'
import { PlanetPanel } from '../components/Panels/PlanetPanel'
import { Terminal } from '../components/Terminal/Terminal'
import { AssistantChat } from '../components/Assistant/AssistantChat'
import { CameraRig } from '../components/Galaxy/CameraRig'
import { Cockpit } from '../components/Cockpit/Cockpit'
import { IntroScene } from './IntroScene'
import { HyperspaceScene } from './HyperspaceScene'
import { GalaxyScene } from './GalaxyScene'
import { Effects } from './Effects'

function useTabVisible() {
  const [visible, setVisible] = useState(!document.hidden)
  useEffect(() => {
    const on = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return visible
}

function Scene() {
  const phase = useApp((s) => s.phase)
  const warpActive = useApp((s) => s.warpActive)
  const quality = useApp((s) => s.quality)
  const cfg = qualityConfig(quality)
  return (
    <>
      <PerspectiveCamera makeDefault fov={55} near={0.05} far={1500}>
        {phase === 'galaxy' && <Cockpit />}
      </PerspectiveCamera>
      <CameraRig />
      {phase === 'intro' && <IntroScene quality={quality} />}
      {(phase === 'hyperspace' || warpActive) && <HyperspaceScene count={cfg.streaks} />}
      {phase === 'galaxy' && <GalaxyScene quality={quality} />}
      {cfg.postfx && <Effects />}
    </>
  )
}

/** Everything that needs three.js lives behind this lazily-loaded module. */
export default function CinematicExperience() {
  const phase = useApp((s) => s.phase)
  const quality = useApp((s) => s.quality)
  const degrade = useApp((s) => s.degradeQuality)
  const tool = useApp((s) => s.tool)
  const fallbackToQuick = useApp((s) => s.fallbackToQuick)
  const setHovered = useApp((s) => s.setHovered)
  const visible = useTabVisible()
  const cfg = qualityConfig(quality)

  useEffect(() => {
    // session memory: a visitor who already saw / skipped the intro goes straight to the jump
    if (introAlreadyHandled()) skipIntro()
    return () => resetDirector()
  }, [])

  return (
    <div
      className="stage"
      onPointerMove={(e) => {
        // the pointer is over HTML UI, not a 3D object: drop any stale 3D hover
        const t = e.target as HTMLElement
        if (t.tagName !== 'CANVAS' && !t.closest('.nav-rail')) setHovered(null)
      }}
    >
      <ErrorBoundary onError={fallbackToQuick}>
        <Canvas
          dpr={[1, cfg.dprMax]}
          frameloop={visible ? 'always' : 'never'}
          gl={{ antialias: quality === 'high', powerPreference: 'high-performance', alpha: false }}
          onCreated={({ gl }) => {
            let timer = 0
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault() // allow the browser to restore the context
              timer = window.setTimeout(fallbackToQuick, 4000)
            })
            gl.domElement.addEventListener('webglcontextrestored', () => window.clearTimeout(timer))
          }}
          aria-label="Interactive 3D galactic command center"
        >
          <color attach="background" args={['#000000']} />
          <PerformanceMonitor onDecline={degrade} flipflops={3} />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </ErrorBoundary>

      <WarpFlash />
      {phase === 'intro' && <IntroOverlay />}
      {phase === 'galaxy' && (
        <>
          <Hud />
          <PlanetPanel />
          {tool === 'terminal' && <Terminal />}
          {tool === 'assistant' && <AssistantChat />}
        </>
      )}
    </div>
  )
}
