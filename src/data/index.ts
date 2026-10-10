import profileJson from './profile.json'
import skillsJson from './skills.json'
import projectsJson from './projects.json'
import talksJson from './talks.json'
import navigationJson from './navigation.json'

export type ContentStatus = 'sample' | 'verified' | 'profile'

export interface TimelineEntry {
  period: string
  title: string
  detail: string
  status: string
}

export interface Profile {
  name: string
  firstName: string
  website: string
  headline: string
  tagline: string
  introLines: { opening: string; motto: string; title: string; domains: string }
  roles: string[]
  experience: { years: string; label: string }
  summary: string
  positioning: string
  specializations: string[]
  affiliationNote: string
  contact: {
    email: string
    linkedin: string
    github: string
    x: string
    youtube: string
    location: string
    collaborateMessage: string
  }
  resume: { url: string; label: string; note: string }
  leadership: { areas: string[]; highlights: string[]; note: string }
  certifications: string[]
  certificationsNote: string
  timeline: TimelineEntry[]
}

export interface SkillGroup {
  id: string
  label: string
  items: string[]
}

export interface Project {
  id: string
  title: string
  description: string
  category: string
  technologies: string[]
  github: string
  demo: string
  architecture: string[]
  status: string
}

export type TalkType = 'talk' | 'webinar' | 'community' | 'article' | 'video'

export interface Talk {
  id: string
  type: TalkType
  title: string
  event: string
  date: string
  url: string
  status: string
}

export interface PlanetMeta {
  id: PlanetId
  name: string
  category: string
  description: string
  color: string
  skillGroup: string | null
  topics: string[]
  terminalAlias: string
  assistantQuestion: string
}

export type PlanetId =
  | 'neural-nexus'
  | 'container-prime'
  | 'architects-forge'
  | 'project-nebula'
  | 'broadcast-station'
  | 'commanders-archive'

export const profile = profileJson as Profile
export const skillGroups = skillsJson.groups as SkillGroup[]
export const projects = projectsJson.projects as Project[]
export const projectsNote = projectsJson.note
export const talks = talksJson.items as Talk[]
export const talkTopics = talksJson.topics as string[]
export const talksNote = talksJson.note
export const planets = navigationJson.planets as PlanetMeta[]

export const planetById = (id: PlanetId): PlanetMeta => planets.find((p) => p.id === id) as PlanetMeta

export const isSample = (status: string) => status === 'sample'
export const hasRealProjects = projects.some((p) => !isSample(p.status))
export const hasRealTalks = talks.some((t) => !isSample(t.status))
