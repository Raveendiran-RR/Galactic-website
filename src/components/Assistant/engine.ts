import {
  hasRealProjects,
  hasRealTalks,
  isSample,
  planets,
  profile,
  projects,
  skillGroups,
  talks,
  talkTopics,
  type PlanetId,
} from '../../data'
import { contactChannels } from '../UI/ContactList'

/* ------------------------------------------------------------------ */
/*  Provider abstraction                                               */
/*  Version 1 ships a local, JSON-driven provider. To add an LLM later */
/*  implement AssistantProvider and register it – see CUSTOMIZATION.md */
/* ------------------------------------------------------------------ */

export type AssistantAction =
  | { kind: 'planet'; label: string; planet: PlanetId; tab?: string }
  | { kind: 'link'; label: string; href: string }
  | { kind: 'ask'; label: string; question: string }
  | { kind: 'quick'; label: string }

export interface AssistantReply {
  text: string
  actions?: AssistantAction[]
}

export interface ChatTurn {
  role: 'user' | 'assistant'
  text: string
}

export interface AssistantProvider {
  id: string
  reply(question: string, history: ChatTurn[]): Promise<AssistantReply>
}

export const GREETING =
  "Greetings, traveler.\n\nWelcome to Raveendiran's universe.\n\nI am RAVI-AI, your navigation companion.\n\nWhich part of his expertise would you like to explore?"

export const STARTERS = [
  'Who is Raveendiran?',
  'What are his technical skills?',
  'What AI projects has he built?',
  'What is his Docker experience?',
  'Has he delivered technical talks?',
  'How can I contact him?',
  'Can I download his resume?',
]

/* ------------------------------ local KB ------------------------------ */

interface Intent {
  id: string
  /** Each entry: a keyword/phrase; matches add weight proportional to its length. */
  keys: string[]
  answer: (q: string) => AssistantReply
}

const list = (items: string[]) => items.map((i) => `• ${i}`).join('\n')
const planetAction = (id: PlanetId, label?: string): AssistantAction => ({
  kind: 'planet',
  planet: id,
  label: label ?? `Visit ${planets.find((p) => p.id === id)?.name}`,
})

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    keys: ['hello', 'hi there', 'hey', 'greetings', 'good morning', 'good evening'],
    answer: () => ({ text: GREETING }),
  },
  {
    id: 'who',
    keys: ['who is', 'who are', 'introduce', 'summary', 'background', 'profile', 'about raveendiran', 'about him', 'tell me about him', ' bio '],
    answer: () => ({
      text: `${profile.summary}\n\n"${profile.headline}"\n${profile.tagline}\n\nRoles: ${profile.roles.join(', ')}.`,
      actions: [planetAction('commanders-archive', "Open Commander's Archive")],
    }),
  },
  {
    id: 'experience',
    keys: ['how many years', 'years of experience', 'years', 'how long', 'senior', 'how experienced'],
    answer: () => ({
      text: `Raveendiran has ${profile.experience.years} ${profile.experience.label}. ${profile.positioning}\n\nA detailed employment history has not been added to this site yet, so I can't list specific roles or employers.`,
      actions: [{ kind: 'planet', planet: 'commanders-archive', tab: 'career', label: 'View career timeline' }],
    }),
  },
  {
    id: 'skills',
    keys: ['skill', 'technical skills', 'expertise', 'tech stack', 'technologies', 'what can he do', 'specializ', 'specialis', 'strength'],
    answer: () => ({
      text: skillGroups.map((g) => `${g.label}:\n${list(g.items)}`).join('\n\n'),
      actions: [planetAction('neural-nexus'), planetAction('container-prime'), planetAction('architects-forge')],
    }),
  },
  {
    id: 'ai',
    keys: ['agentic', 'llm', 'rag', 'mcp', 'ai agent', 'ai security', 'claude code', 'ai architecture', 'artificial intelligence', 'machine learning', 'ai '],
    answer: () => {
      const ai = skillGroups.find((g) => g.id === 'ai')!
      return {
        text: `AI is a core focus area. Topics covered on the Neural Nexus world:\n${list(ai.items)}\n\nRaveendiran is positioned as an AI Architect and Agentic AI Engineer, with deep cloud-native roots. For concrete work, ask me about his projects.`,
        actions: [planetAction('neural-nexus'), { kind: 'ask', label: 'Show AI projects', question: 'What AI projects has he built?' }],
      }
    },
  },
  {
    id: 'ai-projects',
    keys: ['ai project', 'projects', 'built', 'github', 'portfolio', 'what has he built', 'repositor', 'demo', 'open source', 'sandbox'],
    answer: () => {
      const intro = hasRealProjects
        ? 'Here are the projects currently listed:'
        : 'The project gallery currently contains only SAMPLE placeholders (clearly labelled on the site) — no real projects have been published here yet. The entries below show the intended format:'
      const rows = projects.map((p) => `• ${p.title}${isSample(p.status) ? ' [SAMPLE]' : ''} — ${p.description} (${p.technologies.join(', ')})`)
      const gh = profile.contact.github
      return {
        text: `${intro}\n\n${rows.join('\n')}${gh ? '' : '\n\nA GitHub profile link has not been configured yet.'}`,
        actions: [planetAction('project-nebula'), ...(gh ? [{ kind: 'link', label: 'GitHub', href: gh } as AssistantAction] : [])],
      }
    },
  },
  {
    id: 'docker',
    keys: ['docker', 'container', 'kubernetes', 'k8s', 'cloud native', 'cloud-native', 'devops', 'sandbox', 'infrastructure'],
    answer: () => {
      const cloud = skillGroups.find((g) => g.id === 'cloud')!
      return {
        text: `Docker and Kubernetes are core specialisations of Raveendiran, alongside cloud-native architecture. Areas listed:\n${list(cloud.items)}\n\nPlease note: this describes technical expertise and community interest — it does not mean he is employed by Docker. ${'The portfolio does not list specific certifications or employer history for Docker work, so I can\'t add more detail than this.'}`,
        actions: [planetAction('container-prime')],
      }
    },
  },
  {
    id: 'systems',
    keys: ['distributed', 'system design', 'architecture', 'api design', 'integration', 'enterprise', 'program management', 'tpm', 'leadership', 'lead'],
    answer: () => {
      const g = skillGroups.find((x) => x.id === 'systems')!
      return {
        text: `System design & engineering strengths:\n${list(g.items)}\n\nLeadership areas: ${profile.leadership.areas.join(', ')}.${profile.leadership.highlights.length ? '' : '\n\nSpecific leadership achievements have not been added to the site yet, so I can\'t cite any.'}`,
        actions: [planetAction('architects-forge')],
      }
    },
  },
  {
    id: 'talks',
    keys: ['talk', 'speak', 'speaker', 'webinar', 'conference', 'presentation', 'blog', 'article', 'video', 'advocacy', 'advocate', 'community'],
    answer: () => {
      const topics = `Speaking / advocacy topics of focus: ${talkTopics.join(', ')}.`
      const body = hasRealTalks
        ? `Listed engagements:\n${talks.filter((t) => !isSample(t.status)).map((t) => `• ${t.title} — ${t.event} (${t.date})`).join('\n')}`
        : 'Developer Advocacy and technology speaking are part of Raveendiran\'s positioning, but no specific talks, webinars or articles have been published on this site yet — the Broadcast Station currently shows labelled SAMPLE placeholders only. I can\'t confirm any particular engagement.'
      return { text: `${body}\n\n${topics}`, actions: [planetAction('broadcast-station')] }
    },
  },
  {
    id: 'contact',
    keys: ['contact', 'reach', 'email', 'e-mail', 'linkedin', 'hire', 'collaborat', 'get in touch', 'connect', 'message', 'work with'],
    answer: () => {
      const ch = contactChannels()
      const direct = ch.filter((c) => c.key !== 'web')
      return {
        text: `${profile.contact.collaborateMessage}\n\n${ch.map((c) => `• ${c.label}: ${c.value}`).join('\n')}${direct.length ? '' : '\n\nDirect email / social links have not been configured on this site yet — the website is the current point of contact.'}`,
        actions: [{ kind: 'planet', planet: 'commanders-archive', tab: 'contact', label: 'Open contact panel' }, ...ch.slice(0, 3).map((c) => ({ kind: 'link', label: c.label, href: c.href }) as AssistantAction)],
      }
    },
  },
  {
    id: 'resume',
    keys: ['resume', 'résumé', 'cv', 'curriculum', 'download'],
    answer: () =>
      profile.resume.url
        ? { text: 'Yes — the resume is available for download.', actions: [{ kind: 'link', label: profile.resume.label, href: profile.resume.url }] }
        : {
            text: 'A resume file has not been published on this site yet, so there is nothing to download right now. Please use the contact options for a copy.',
            actions: [{ kind: 'planet', planet: 'commanders-archive', tab: 'contact', label: 'Open contact panel' }],
          },
  },
  {
    id: 'certs',
    keys: ['certif', 'credential', 'qualif', 'degree', 'education'],
    answer: () => ({
      text: profile.certifications.length
        ? `Certifications:\n${list(profile.certifications)}`
        : 'No certifications or formal education details have been added to this site yet, so I can\'t list any. I\'d rather say so than guess.',
      actions: [{ kind: 'planet', planet: 'commanders-archive', tab: 'leadership', label: 'Open leadership & certifications' }],
    }),
  },
  {
    id: 'employer',
    keys: ['employer', 'works at', 'work at', 'currently work', 'current job', 'employed', 'company', 'job', 'career'],
    answer: () => ({
      text: `Employment history has not been added to this site yet, so I can't name employers or dates.\n\nWhat is documented: ${profile.experience.years} ${profile.experience.label}, with a move toward AI Architecture, Agentic AI Engineering and Developer Advocacy.\n\n${profile.affiliationNote}`,
      actions: [{ kind: 'planet', planet: 'commanders-archive', tab: 'career', label: 'View career timeline' }],
    }),
  },
  {
    id: 'navigate',
    keys: ['show me', 'take me', 'go to', 'open', 'navigate', 'visit', 'fly'],
    answer: (q) => {
      const hit = planets.find((p) => q.includes(p.name.toLowerCase().replace(/['’]/g, '')) || q.includes(p.terminalAlias) || p.topics.some((t) => q.includes(t.toLowerCase())))
      return hit
        ? { text: `Plotting a course to ${hit.name} — ${hit.description}`, actions: [planetAction(hit.id)] }
        : { text: 'Where would you like to go? Choose a destination:', actions: planets.map((p) => planetAction(p.id, p.name)) }
    },
  },
  {
    id: 'quick',
    keys: ['quick profile', 'simple', 'recruiter', 'traditional', 'plain'],
    answer: () => ({ text: 'The Quick Profile is a fast, traditional view of the same information — ideal for a 30-second review.', actions: [{ kind: 'quick', label: 'Open Quick Profile' }] }),
  },
  {
    id: 'thanks',
    keys: ['thank', 'thanks', 'cheers', 'appreciate'],
    answer: () => ({ text: 'Always a pleasure. Safe travels, traveler.' }),
  },
]

function normalise(q: string) {
  return ` ${q.toLowerCase().replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ').trim()} `
}

export function matchIntent(question: string): Intent | null {
  const q = normalise(question)
  let best: { intent: Intent; score: number } | null = null
  for (const intent of INTENTS) {
    let score = 0
    for (const k of intent.keys) if (q.includes(k.length <= 3 ? ` ${k} ` : k)) score += k.length
    if (score > (best?.score ?? 0)) best = { intent, score }
  }
  return best && best.score >= 2 ? best.intent : null
}

export const localProvider: AssistantProvider = {
  id: 'local-knowledge-base',
  async reply(question) {
    const intent = matchIntent(question)
    if (intent) return intent.answer(normalise(question))
    return {
      text: "I can only answer from the information published on this site, and I don't have anything on that. I'd rather say so than invent an answer.\n\nTry asking about his background, skills, projects, Docker experience, talks, contact options or resume.",
      actions: STARTERS.slice(0, 4).map((s) => ({ kind: 'ask', label: s, question: s }) as AssistantAction),
    }
  },
}

/* ---------------------------- LLM backend hook ---------------------------- */

/**
 * Future LLM integration. Point VITE_ASSISTANT_ENDPOINT at YOUR OWN server-side
 * proxy (which holds the model API key). Never put provider keys in browser code.
 * The proxy should accept { question, history } and return { text, actions? }.
 * Any failure falls back to the local knowledge base.
 */
export function createRemoteProvider(endpoint: string, fallback: AssistantProvider = localProvider): AssistantProvider {
  return {
    id: 'remote-proxy',
    async reply(question, history) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, history }),
        })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as AssistantReply
        if (typeof data.text !== 'string') throw new Error('bad payload')
        return data
      } catch {
        return fallback.reply(question, history)
      }
    },
  }
}

let active: AssistantProvider | null = null
export function getProvider(): AssistantProvider {
  if (active) return active
  const endpoint = import.meta.env.VITE_ASSISTANT_ENDPOINT as string | undefined
  active = endpoint ? createRemoteProvider(endpoint) : localProvider
  return active
}
export function setProvider(p: AssistantProvider) {
  active = p
}
