import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { isSample } from '../../data'

export const SampleBadge = ({ status }: { status: string }) => (isSample(status) ? <span className="badge-sample">SAMPLE</span> : null)

export function Chips({ items }: { items: string[] }) {
  return (
    <div className="chips">
      {items.map((t) => (
        <span className="chip" key={t}>
          {t}
        </span>
      ))}
    </div>
  )
}

/** Renders a real link when a URL exists, otherwise a clearly disabled control – never a dead link. */
export function LinkButton({ href, children, emptyLabel }: { href: string; children: ReactNode; emptyLabel: string }) {
  if (!href) {
    return (
      <button className="btn-holo sm" disabled title={emptyLabel}>
        {children}
      </button>
    )
  }
  return (
    <a className="btn-holo sm" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <ExternalLink size={12} />
    </a>
  )
}
