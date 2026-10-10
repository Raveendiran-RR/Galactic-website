import { planets, profile, projects, skillGroups, talks, hasRealProjects, hasRealTalks, isSample, projectsNote, talksNote } from '../../data'
import { contactChannels } from '../UI/ContactList'

export type LineKind = 'in' | 'out' | 'err' | 'acc' | 'link'
export interface Line {
  kind: LineKind
  text: string
  href?: string
}

export interface TerminalEffects {
  openUrl: (url: string) => void
  download: (url: string) => void
  returnToGalaxy: () => void
  focusPlanet: (id: (typeof planets)[number]['id'], tab?: string) => void
  setQuick: () => void
}

export interface CommandDef {
  name: string
  help: string
  run: (args: string[], fx: TerminalEffects) => Line[] | 'clear'
}

const out = (text: string): Line => ({ kind: 'out', text })
const acc = (text: string): Line => ({ kind: 'acc', text })
const err = (text: string): Line => ({ kind: 'err', text })

export const COMMANDS: CommandDef[] = [
  {
    name: 'help',
    help: 'List available commands',
    run: () => [
      acc('AVAILABLE COMMANDS:'),
      ...COMMANDS.map((c) => out(`  ${c.name.padEnd(11)}${c.help}`)),
    ],
  },
  {
    name: 'whoami',
    help: 'Display professional introduction',
    run: () => [
      acc(profile.name.toUpperCase()),
      out(profile.headline),
      out(`${profile.experience.years} ${profile.experience.label}.`),
      out(''),
      out(profile.positioning),
      out(''),
      out('Roles: ' + profile.roles.join(' · ')),
    ],
  },
  {
    name: 'skills',
    help: 'Explore technical expertise',
    run: () => skillGroups.flatMap((g) => [acc(g.label.toUpperCase()), out('  ' + g.items.join(' · '))]),
  },
  {
    name: 'projects',
    help: 'Show engineering projects',
    run: () => [
      acc(`PROJECTS (${projects.length})`),
      ...projects.flatMap((p) => [
        out(`  ▸ ${p.title}${isSample(p.status) ? '  [SAMPLE]' : ''}`),
        out(`    ${p.description}`),
        out(`    ${p.technologies.join(', ')}`),
        ...(p.github ? [{ kind: 'link', text: `    ${p.github}`, href: p.github } as Line] : []),
      ]),
      ...(hasRealProjects ? [] : [out(''), out(projectsNote)]),
    ],
  },
  {
    name: 'github',
    help: 'Open GitHub profile',
    run: (_a, fx) => {
      const url = profile.contact.github
      if (!url) return [err('GitHub profile is not configured yet.'), out('Set contact.github in src/data/profile.json.')]
      fx.openUrl(url)
      return [out('Opening GitHub profile…'), { kind: 'link', text: url, href: url }]
    },
  },
  {
    name: 'talks',
    help: 'Explore speaking engagements',
    run: () => [
      acc('SPEAKING & ADVOCACY'),
      ...talks.map((t) => out(`  ▸ [${t.type.toUpperCase()}] ${t.title}${t.event ? ' — ' + t.event : ''}`)),
      ...(hasRealTalks ? [] : [out(''), out(talksNote)]),
    ],
  },
  {
    name: 'resume',
    help: 'Download resume',
    run: (_a, fx) => {
      const url = profile.resume.url
      if (!url) return [err('No resume file is published yet.'), out(profile.resume.note)]
      fx.download(url)
      return [out('Starting download…'), { kind: 'link', text: url, href: url }]
    },
  },
  {
    name: 'contact',
    help: 'Open communication channel',
    run: (_a, fx) => {
      const ch = contactChannels()
      const email = ch.find((c) => c.key === 'email')
      if (email) fx.openUrl(email.href)
      else fx.focusPlanet('commanders-archive', 'contact')
      return [
        acc('COMMUNICATION CHANNELS'),
        ...ch.map((c) => ({ kind: 'link', text: `  ${c.label.padEnd(10)} ${c.value}`, href: c.href }) as Line),
        ...(ch.length === 1 ? [out(''), out('Direct email / social links are not configured yet.')] : []),
      ]
    },
  },
  {
    name: 'galaxy',
    help: 'Return to galactic map',
    run: (_a, fx) => {
      fx.returnToGalaxy()
      return [out('Returning to galactic map…')]
    },
  },
  {
    name: 'open',
    help: 'Open a destination: open <name>',
    run: (args, fx) => {
      const q = args.join(' ').toLowerCase().replace(/['’]/g, '')
      if (!q) return [out('Usage: open <destination>'), ...planets.map((p) => out(`  ${p.terminalAlias.padEnd(10)} ${p.name}`))]
      const p = planets.find((x) => x.terminalAlias === q || x.id.replace(/-/g, ' ').includes(q) || x.name.toLowerCase().replace(/['’]/g, '').includes(q))
      if (!p) return [err(`Unknown destination: ${q}`), out('Try: ' + planets.map((x) => x.terminalAlias).join(', '))]
      fx.focusPlanet(p.id)
      return [out(`Plotting course to ${p.name}…`)]
    },
  },
  {
    name: 'quick',
    help: 'Switch to the Quick Profile',
    run: (_a, fx) => {
      fx.setQuick()
      return [out('Switching to Quick Profile…')]
    },
  },
  { name: 'clear', help: 'Clear terminal', run: () => 'clear' },
]

function distance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

export function suggest(prefix: string): string[] {
  const p = prefix.trim().toLowerCase()
  if (!p) return []
  return COMMANDS.map((c) => c.name).filter((n) => n.startsWith(p) && n !== p)
}

export function run(input: string, fx: TerminalEffects): Line[] | 'clear' {
  const [cmd, ...args] = input.trim().split(/\s+/)
  if (!cmd) return []
  const def = COMMANDS.find((c) => c.name === cmd.toLowerCase())
  if (def) return def.run(args, fx)
  const near = COMMANDS.map((c) => ({ n: c.name, d: distance(cmd.toLowerCase(), c.name) })).sort((a, b) => a.d - b.d)[0]
  return [err(`command not found: ${cmd}`), out(near && near.d <= 3 ? `Did you mean '${near.n}'?  (type 'help' for all commands)` : "Type 'help' for available commands.")]
}
