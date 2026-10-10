import { Starfield } from '../components/Galaxy/Starfield'
import { Nebula } from '../components/Galaxy/Nebula'
import { qualityConfig, type Quality } from '../utils/quality'
import { useApp } from '../stores/useApp'

export function IntroScene({ quality }: { quality: Quality }) {
  const cfg = qualityConfig(quality)
  const reduced = useApp((s) => s.reducedMotion)
  return (
    <>
      <Starfield count={cfg.tunnelStars} mode="tunnel" drift={reduced ? 0 : 7} fadeWithIntro />
      {cfg.nebula && <Nebula octaves={cfg.nebulaOctaves} strength={0.18} colorA="#0b2a8a" colorB="#4a1a8a" />}
    </>
  )
}
