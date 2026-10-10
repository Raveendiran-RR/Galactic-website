import { Rocket, Zap, Download } from 'lucide-react'
import { hasRealTalks, planets, profile, skillGroups } from '../../data'
import { useApp } from '../../stores/useApp'
import { Chips } from '../UI/Bits'
import { ContactList } from '../UI/ContactList'
import { openHire } from '../UI/hire'
import { ProjectsSection, Timeline, TalksSection } from '../Panels/sections'

const SECTIONS = ['about', 'skills', 'projects', 'speaking', 'career', 'contact']

/** Fast, traditional profile. Pure DOM – works without WebGL and loads without three.js. */
export function QuickProfile() {
  const setMode = useApp((s) => s.setMode)
  const webgl = useApp((s) => s.webgl)

  return (
    <main className="qp">
      <div className="qp-stars" aria-hidden="true" />
      <div className="qp-nav">
        <b className="display" style={{ fontSize: 12, letterSpacing: '0.22em', whiteSpace: 'nowrap' }}>
          RAVEENDIRAN.COM
        </b>
        <nav aria-label="Sections">
          {SECTIONS.map((s) => (
            <a key={s} href={`#${s}`}>
              {s}
            </a>
          ))}
        </nav>
        <button className="btn-holo amber sm" onClick={openHire}>
          <Zap size={13} /> Hire / Collaborate
        </button>
      </div>

      <header className="qp-section" style={{ paddingTop: 72, paddingBottom: 40 }} id="top">
        <div className="eyebrow">{profile.introLines.title}</div>
        <h1 className="display" style={{ margin: '10px 0 8px', fontWeight: 900, fontSize: 'clamp(30px,6vw,64px)', lineHeight: 1.05, color: '#fff' }}>
          {profile.name}
        </h1>
        <p style={{ fontSize: 'clamp(20px,2.6vw,30px)', margin: '0 0 6px', color: '#cfeaff', maxWidth: 760 }}>{profile.headline}</p>
        <p style={{ fontSize: 19, margin: '0 0 22px', color: 'var(--amber)' }}>{profile.tagline}</p>
        <Chips items={profile.roles} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
          <button className="btn-holo amber" onClick={openHire}>
            <Zap size={14} /> [ HIRE / COLLABORATE ]
          </button>
          {profile.resume.url && (
            <a className="btn-holo" href={profile.resume.url} download>
              <Download size={14} /> {profile.resume.label}
            </a>
          )}
          {webgl ? (
            <button className="btn-holo" onClick={() => setMode('cinematic')}>
              <Rocket size={14} /> Enter cinematic experience
            </button>
          ) : (
            <span className="note" style={{ margin: 0 }}>
              3D mode is unavailable on this device (WebGL not supported) — this profile has everything.
            </span>
          )}
        </div>
      </header>

      <section className="qp-section" style={{ paddingTop: 24 }} aria-label="At a glance">
        <div className="qp-grid">
          <div className="qp-card">
            <div className="stat">{profile.experience.years}</div>
            <p>{profile.experience.label}</p>
          </div>
          <div className="qp-card">
            <h3>FOCUS</h3>
            <p>{profile.specializations.slice(0, 4).join(' · ')}</p>
          </div>
          <div className="qp-card">
            <h3>POSITIONING</h3>
            <p>{profile.positioning}</p>
          </div>
        </div>
      </section>

      <section className="qp-section" id="about">
        <h2>ABOUT</h2>
        <p style={{ maxWidth: 780, fontSize: 19 }}>{profile.summary}</p>
        <Chips items={profile.specializations} />
        <p className="note" style={{ maxWidth: 780 }}>
          {profile.affiliationNote}
        </p>
      </section>

      <section className="qp-section" id="skills">
        <h2>SKILLS</h2>
        <div className="qp-grid">
          {skillGroups.map((g) => (
            <div className="qp-card" key={g.id}>
              <h3>{g.label.toUpperCase()}</h3>
              <Chips items={g.items} />
            </div>
          ))}
        </div>
      </section>

      <section className="qp-section" id="projects">
        <h2>PROJECTS</h2>
        <ProjectsSection />
      </section>

      <section className="qp-section" id="speaking">
        <h2>SPEAKING</h2>
        <TalksSection />
        {!hasRealTalks && null}
      </section>

      <section className="qp-section" id="career">
        <h2>CAREER</h2>
        <div style={{ maxWidth: 780 }}>
          <Timeline />
          <h3 className="eyebrow" style={{ marginTop: 28 }}>
            LEADERSHIP
          </h3>
          <Chips items={profile.leadership.areas} />
          <h3 className="eyebrow" style={{ marginTop: 28 }}>
            CERTIFICATIONS
          </h3>
          <p style={{ color: 'var(--mute)' }}>{profile.certifications.length ? profile.certifications.join(' · ') : 'No certifications are listed on this site yet.'}</p>
        </div>
      </section>

      <section className="qp-section" id="contact">
        <h2>CONTACT</h2>
        <div style={{ maxWidth: 560 }}>
          <ContactList />
        </div>
        <p style={{ marginTop: 40, color: 'var(--mute)', fontSize: 14 }}>
          © {new Date().getFullYear()} {profile.name} · Destinations in the 3D experience: {planets.map((p) => p.name).join(', ')}
        </p>
      </section>
    </main>
  )
}
