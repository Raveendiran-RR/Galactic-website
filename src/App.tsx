import { lazy, Suspense } from 'react'
import { useApp } from './stores/useApp'
import { QuickProfile } from './components/QuickProfile/QuickProfile'

// three.js, R3F and postprocessing are only downloaded when the cinematic mode is used.
const CinematicExperience = lazy(() => import('./scenes/CinematicExperience'))

export default function App() {
  const mode = useApp((s) => s.mode)
  const webgl = useApp((s) => s.webgl)

  if (mode === 'quick' || !webgl) return <QuickProfile />

  return (
    <Suspense
      fallback={
        <div className="loader" role="status">
          INITIALISING HYPERDRIVE…
        </div>
      }
    >
      <CinematicExperience />
    </Suspense>
  )
}
