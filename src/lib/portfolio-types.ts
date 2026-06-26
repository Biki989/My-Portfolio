// Shared portfolio types used across the CRM frontend.

export type MarqueeItem = { id: string; text: string; order: number }
export type ProjectTech = { id: string; name: string; order: number }
export type Project = {
  id: string
  tag: string
  year: string
  title: string
  description: string
  liveUrl: string
  order: number
  techs: ProjectTech[]
}
export type Stat = { id: string; count: number; suffix: string; label: string; order: number }
export type StackItem = { id: string; name: string; order: number }
export type StackGroup = {
  id: string
  title: string
  order: number
  items: StackItem[]
}
export type Social = { id: string; label: string; url: string; order: number }

export type PortfolioConfig = {
  id?: string
  brandMark: string
  brandName: string
  seoTitle: string
  seoDescription: string

  heroEyebrow: string
  heroLine1: string
  heroLine2Em: string
  heroLine2Text: string
  heroLine3Pre: string
  heroLine3Em: string
  heroLede: string
  heroPrimaryBtn: string
  heroSecondaryBtn: string

  workSectionIndex: string
  workSectionTitle: string
  workSectionSub: string

  aboutSectionIndex: string
  aboutSectionTitle: string
  aboutLede: string
  aboutPara1: string
  aboutPara2: string

  stackSectionIndex: string
  stackSectionTitle: string
  stackSectionSub: string

  contactEyebrow: string
  contactEmail: string
  contactSub: string

  footerName: string
  footerMeta: string
}

export type PortfolioData = {
  config: PortfolioConfig
  marquee: MarqueeItem[]
  projects: Project[]
  stats: Stat[]
  stack: StackGroup[]
  socials: Social[]
}

export const EMPTY_CONFIG: PortfolioConfig = {
  brandMark: 'BK',
  brandName: '',
  seoTitle: '',
  seoDescription: '',
  heroEyebrow: '',
  heroLine1: '',
  heroLine2Em: '',
  heroLine2Text: '',
  heroLine3Pre: '',
  heroLine3Em: '',
  heroLede: '',
  heroPrimaryBtn: '',
  heroSecondaryBtn: '',
  workSectionIndex: '01',
  workSectionTitle: '',
  workSectionSub: '',
  aboutSectionIndex: '02',
  aboutSectionTitle: '',
  aboutLede: '',
  aboutPara1: '',
  aboutPara2: '',
  stackSectionIndex: '03',
  stackSectionTitle: '',
  stackSectionSub: '',
  contactEyebrow: '',
  contactEmail: '',
  contactSub: '',
  footerName: '',
  footerMeta: '',
}

export function newId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  )
}
