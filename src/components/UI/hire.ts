import { useApp } from '../../stores/useApp'
import { sfx } from '../../utils/audio'

/** Shared "HIRE / COLLABORATE" behaviour for both modes. */
export function openHire() {
  sfx.confirm()
  const app = useApp.getState()
  if (app.mode === 'quick') {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    return
  }
  app.setTool(null)
  app.focusPlanet('commanders-archive', 'contact')
}
