import { Volume2, VolumeX } from 'lucide-react'
import { useApp } from '../../stores/useApp'
import { setAudioEnabled } from '../../utils/audio'

export function SoundToggle() {
  const on = useApp((s) => s.soundOn)
  return (
    <button className="btn-holo" aria-pressed={on} onClick={() => setAudioEnabled(!on)} title="Toggle interface sound (off by default)" aria-label={`Sound ${on ? 'on' : 'off'}`}>
      {on ? <Volume2 size={14} /> : <VolumeX size={14} />}
      <span className="lbl-full">[ SOUND {on ? 'ON' : 'OFF'} ]</span>
    </button>
  )
}
