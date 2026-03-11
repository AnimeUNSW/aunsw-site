export type EventCategory =
  | "club"
  | "social"
  | "trivia"
  | "cosplay"
  | "challenge"

export type SponsorTier = "diamond" | "gold" | "silver" | "community"

export type FAQCategory = "membership" | "discord" | "events" | "general"

export interface Event {
  id: string
  slug: string
  title: string
  description: string
  category: EventCategory
  startDateTime: string
  endDateTime: string
  location: string
  image?: string
  imageAlt?: string
  tags: string[]
  featured: boolean
  registrationUrl?: string
}

export interface Sponsor {
  id: string
  name: string
  logoText: string
  websiteUrl: string
  tier: SponsorTier
  image?: string
  imageAlt?: string
  discountDescription: string
  promoCode?: string
  terms: string
  validUntil?: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: FAQCategory
}

export interface SocialLinks {
  discord: string
  instagram: string
  facebook?: string
  youtube?: string
  email: string
  linktree?: string
}

export interface ClubStats {
  memberCount: number
  activeSince: number
  eventsPerTerm: number
  sponsorCount: number
  lastUpdated: string
}

export interface Contact {
  label: string
  email: string
}

export interface MembershipPath {
  id: string
  label: string
  summary: string
  steps: string[]
}

export interface SiteContent {
  clubName: string
  hero: {
    badge: string
    title: string
    subtitle: string
    image?: string
    imageAlt?: string
    primaryCta: {
      label: string
      href: string
    }
    secondaryCta: {
      label: string
      href: string
    }
  }
  clubDescription: string
  eventsOverview: string
  sponsorPerksOverview: string
  discordOverview: string
  socialLinks: SocialLinks
  clubStats: ClubStats
  membershipPaths: MembershipPath[]
  contacts: Contact[]
}

export type TeamMembership = "top5" | "executive" | "director" | "other"

export interface TeamProfile {
  id: string
  name: string
  role: string
  membership: TeamMembership
  portfolio: string
  displayOrder: number
  pronouns?: string
  portraitImage: string
  portraitAlt: string
  degree: string[]
  funFacts: string[]
  favoriteAnime: string[]
  extras?: string[]
  discordHandle?: string
}

export interface ContentRepository {
  getEvents: () => Event[]
  getSponsors: () => Sponsor[]
  getFaqs: () => FAQ[]
  getSiteContent: () => SiteContent
  getTeamProfiles: () => TeamProfile[]
}
