import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { fx } from '../../stores/fx'

/** DOM flash driven by fx.flash through GSAP's ticker – no React re-renders. */
export function WarpFlash() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const tick = () => {
      if (ref.current) ref.current.style.opacity = String(fx.flash)
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])
  return <div id="warp-flash" ref={ref} aria-hidden="true" />
}
