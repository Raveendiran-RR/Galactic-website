import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { fx } from '../stores/fx'
import { useApp } from '../stores/useApp'

/** Restrained bloom + vignette; chromatic aberration only spikes during the jump. */
export function Effects() {
  const quality = useApp((s) => s.quality)
  const reduced = useApp((s) => s.reducedMotion)
  const offset = useRef(new THREE.Vector2(0, 0))
  const bloom = useRef<{ intensity: number } | null>(null)

  useFrame(() => {
    const w = reduced ? 0 : fx.warp
    offset.current.set(0.0045 * w, 0.0045 * w)
    if (bloom.current) bloom.current.intensity = 0.55 + w * 0.7
  })

  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 0} enableNormalPass={false}>
      <Bloom
        ref={bloom as never}
        intensity={0.55}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.25}
        mipmapBlur
        radius={0.7}
      />
      <ChromaticAberration offset={offset.current} radialModulation={false} modulationOffset={0} blendFunction={BlendFunction.NORMAL} />
      <Vignette eskil={false} offset={0.25} darkness={0.7} />
    </EffectComposer>
  )
}
