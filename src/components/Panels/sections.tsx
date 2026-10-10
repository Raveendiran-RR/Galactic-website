import { useState, type PointerEvent } from 'react'
import { Download, GitBranch, Play, Layers } from 'lucide-react'
import {
  hasRealProjects,
  hasRealTalks,
  isSample,
  profile,
  projects,
  projectsNote,
  skillGroups,
  talks,
  talksNote,
  talkTopics,
  type PlanetMeta,
  type Project,
  type Talk,
} from '../../data'
import { Chips, LinkButton, SampleBadge } from '../UI/Bits'
import { ContactList } from '../UI/ContactList'
import { useApp } from '../../stores/useApp'

export function ProjectCard({ p }: { p: Project }) {
  const [open, setOpen] = useState(false)
  // pointer-driven tilt: a cheap, GPU-only 3D hover effect
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (useApp.getState().reducedMotion || e.pointerType === 'touch') return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateZ(6px)`
  }
  const onLeave = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.transform = ''
  }
  return (
    <article className="proj-card" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="eyebrow" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span>{p.category}</span>
        <SampleBadge status={p.status} />
      </div>
      <h4>{p.title}</h4>
      <p>{p.description}</p>
      <Chips items={p.technologies} />
      <div className="proj-actions">
        <LinkButton href={p.github} emptyLabel="GitHub link not added yet">
          <GitBranch size={13} /> GitHub
        </LinkButton>
        <LinkButton href={p.demo} emptyLabel="No public demo yet">
          <Play size={13} /> Demo
        </LinkButton>
        <button className="btn-holo sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <Layers size={13} /> Architecture
        </button>
      </div>
      {open && (
        <ol className="arch">
          {p.architecture.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
    </article>
  )
}

export function ProjectsSection({ filter }: { filter?: string[] }) {
  const list = filter ? projects.filter((p) => p.technologies.some((t) => filter.some((f) => f.toLowerCase() === t.toLowerCase()))) : projects
  if (!list.length) return <p className="note">No projects are tagged for this area yet.</p>
  return (
    <>
      <div className="cards">
        {list.map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
      </div>
      {!hasRealProjects && <p className="note">{projectsNote}</p>}
    </>
  )
}

const TALK_LABEL: Record<Talk['type'], string> = {
  talk: 'Conference & technical talks',
  webinar: 'Webinars',
  community: 'Developer community contributions',
  article: 'Blog articles',
  video: 'Video content',
}

export function TalksSection() {
  const order: Talk['type'][] = ['talk', 'webinar', 'community', 'article', 'video']
  return (
    <>
      <h3>Speaking & advocacy topics</h3>
      <Chips items={talkTopics} />
      {order.map((t) => {
        const list = talks.filter((x) => x.type === t)
        if (!list.length) return null
        return (
          <section key={t}>
            <h3>{TALK_LABEL[t]}</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {list.map((x) => (
                <li key={x.id} className="qp-card" style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <b style={{ color: '#fff' }}>{x.title}</b>
                    <SampleBadge status={x.status} />
                  </div>
                  <span style={{ color: 'var(--mute)', fontSize: 15 }}>
                    {x.event} · {x.date}
                  </span>
                  {x.url && !isSample(x.status) && (
                    <div style={{ marginTop: 6 }}>
                      <LinkButton href={x.url} emptyLabel="">
                        Open
                      </LinkButton>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      {!hasRealTalks && <p className="note">{talksNote}</p>}
    </>
  )
}

export function SkillsSection({ only }: { only?: string | null }) {
  const groups = only ? skillGroups.filter((g) => g.id === only) : skillGroups
  return (
    <>
      {groups.map((g) => (
        <section key={g.id}>
          <h3>{g.label}</h3>
          <Chips items={g.items} />
        </section>
      ))}
    </>
  )
}

export function ResumeBlock() {
  const r = profile.resume
  return r.url ? (
    <a className="btn-holo amber" href={r.url} download>
      <Download size={14} /> {r.label}
    </a>
  ) : (
    <div>
      <button className="btn-holo" disabled>
        <Download size={14} /> {r.label}
      </button>
      <p className="note">Resume not yet published on this site.</p>
    </div>
  )
}

export function Timeline() {
  return (
    <ol className="timeline">
      {profile.timeline.map((t) => (
        <li key={t.title} data-status={t.status}>
          <small>{t.period}</small>
          <b>
            {t.title} {t.status === 'sample' && <span className="badge-sample">SAMPLE</span>}
          </b>
          <span style={{ color: 'var(--mute)' }}>{t.detail}</span>
        </li>
      ))}
    </ol>
  )
}

const ARCHIVE_TABS = ['summary', 'career', 'leadership', 'skills', 'resume', 'contact'] as const

export function ArchiveSection() {
  const requested = useApp((s) => s.panelTab)
  const [tab, setTab] = useState<string>(requested && ARCHIVE_TABS.includes(requested as never) ? requested : 'summary')
  return (
    <>
      <div className="tabs" role="tablist">
        {ARCHIVE_TABS.map((t) => (
          <button key={t} role="tab" className="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'summary' && (
        <>
          <p>{profile.summary}</p>
          <h3>Specialisations</h3>
          <Chips items={profile.specializations} />
          <h3>Roles</h3>
          <Chips items={profile.roles} />
          <p className="note">{profile.affiliationNote}</p>
        </>
      )}
      {tab === 'career' && (
        <>
          <Timeline />
          <p className="note">{profile.positioning}</p>
        </>
      )}
      {tab === 'leadership' && (
        <>
          <h3>Leadership & delivery</h3>
          <Chips items={profile.leadership.areas} />
          {profile.leadership.highlights.length > 0 ? (
            <ul>
              {profile.leadership.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          ) : (
            <p className="note">Detailed leadership achievements have not been added to this site yet.</p>
          )}
          <h3>Certifications</h3>
          {profile.certifications.length > 0 ? (
            <ul>
              {profile.certifications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="note">No certifications are listed on this site yet.</p>
          )}
        </>
      )}
      {tab === 'skills' && <SkillsSection />}
      {tab === 'resume' && <ResumeBlock />}
      {tab === 'contact' && <ContactList />}
    </>
  )
}

export function TopicsBlock({ meta }: { meta: PlanetMeta }) {
  const ask = useApp((s) => s.askAssistant)
  return (
    <>
      <h3>Focus areas</h3>
      <Chips items={meta.topics} />
      <div style={{ marginTop: 16 }}>
        <button className="btn-holo sm" onClick={() => ask(meta.assistantQuestion)}>
          Ask RAVI-AI about this
        </button>
      </div>
    </>
  )
}
