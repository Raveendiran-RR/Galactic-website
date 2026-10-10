import { Globe, Mail, Briefcase, GitBranch, Video, MapPin, AtSign } from 'lucide-react'
import { profile } from '../../data'

export interface Channel {
  key: string
  label: string
  value: string
  href: string
}

/** Only channels that actually have a value are returned. */
export function contactChannels(): Channel[] {
  const c = profile.contact
  const list: Channel[] = [{ key: 'web', label: 'Website', value: profile.website.replace(/^https?:\/\//, ''), href: profile.website }]
  if (c.email) list.push({ key: 'email', label: 'Email', value: c.email, href: `mailto:${c.email}` })
  if (c.linkedin) list.push({ key: 'linkedin', label: 'LinkedIn', value: c.linkedin.replace(/^https?:\/\//, ''), href: c.linkedin })
  if (c.github) list.push({ key: 'github', label: 'GitHub', value: c.github.replace(/^https?:\/\//, ''), href: c.github })
  if (c.x) list.push({ key: 'x', label: 'X', value: c.x.replace(/^https?:\/\//, ''), href: c.x })
  if (c.youtube) list.push({ key: 'youtube', label: 'YouTube', value: c.youtube.replace(/^https?:\/\//, ''), href: c.youtube })
  return list
}

const ICONS: Record<string, typeof Globe> = { web: Globe, email: Mail, linkedin: Briefcase, github: GitBranch, x: AtSign, youtube: Video }

export function ContactList() {
  const channels = contactChannels()
  const direct = channels.some((c) => c.key !== 'web')
  return (
    <div>
      <p>{profile.contact.collaborateMessage}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gap: 8 }}>
        {channels.map((c) => {
          const Icon = ICONS[c.key] ?? Globe
          return (
            <li key={c.key}>
              <a className="btn-holo" style={{ width: '100%', justifyContent: 'flex-start', textTransform: 'none', letterSpacing: '0.06em' }} href={c.href} target={c.key === 'email' ? undefined : '_blank'} rel="noopener noreferrer">
                <Icon size={15} />
                <b style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.18em' }}>{c.label.toUpperCase()}</b>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 15 }}>{c.value}</span>
              </a>
            </li>
          )
        })}
      </ul>
      {profile.contact.location && (
        <p style={{ marginTop: 12 }}>
          <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} />
          {profile.contact.location}
        </p>
      )}
      {!direct && <p className="note">Direct email and social links are being updated. For now, please reach out through {profile.website.replace(/^https?:\/\//, '')}.</p>}
    </div>
  )
}
