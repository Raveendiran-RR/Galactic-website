import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { planetById } from '../../data'
import { useApp } from '../../stores/useApp'
import { sfx } from '../../utils/audio'
import { ArchiveSection, ProjectsSection, TalksSection, TopicsBlock } from './sections'

/** Holographic information panel for the focused destination. */
export function PlanetPanel() {
  const focus = useApp((s) => s.focus)
  const panelTab = useApp((s) => s.panelTab)
  const returnToGalaxy = useApp((s) => s.returnToGalaxy)
  const body = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!focus) return
    sfx.holo()
    body.current?.scrollTo({ top: 0 })
    head.current?.focus({ preventScroll: true })
  }, [focus])

  if (!focus) return null
  const meta = planetById(focus)

  return (
    <aside key={focus} className="panel holo-panel" style={{ ['--c' as string]: meta.color }} role="dialog" aria-label={`${meta.name} — ${meta.category}`}>
      <div className="panel-head">
        <div className="eyebrow">{meta.category}</div>
        <h2 ref={head} tabIndex={-1}>
          {meta.name}
        </h2>
        <p>{meta.description}</p>
        <button className="icon-btn" style={{ position: 'absolute', top: 10, right: 10 }} aria-label="Return to galaxy" onClick={returnToGalaxy}>
          <X size={18} />
        </button>
      </div>
      <div className="panel-body" ref={body}>
        {focus === 'neural-nexus' || focus === 'container-prime' || focus === 'architects-forge' ? (
          <>
            <TopicsBlock meta={meta} />
            <h3>Related projects</h3>
            <ProjectsSection filter={meta.topics} />
          </>
        ) : null}
        {focus === 'project-nebula' && <ProjectsSection />}
        {focus === 'broadcast-station' && <TalksSection />}
        {focus === 'commanders-archive' && <ArchiveSection key={panelTab ?? 'summary'} />}
      </div>
    </aside>
  )
}
