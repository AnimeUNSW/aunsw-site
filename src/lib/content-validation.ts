import type {
  Contact,
  Event,
  EventCategory,
  FAQ,
  FAQCategory,
  MembershipPath,
  SiteContent,
  SocialLinks,
  Sponsor,
  SponsorTier,
  TeamMembership,
  TeamProfile,
} from "@/types/content"

type JsonObject = Record<string, unknown>

const EVENT_CATEGORIES: EventCategory[] = [
  "weekly",
  "trivia",
  "cosplay",
  "challenge",
  "past",
]

const SPONSOR_TIERS: SponsorTier[] = ["diamond", "gold", "silver", "community"]

const FAQ_CATEGORIES: FAQCategory[] = [
  "membership",
  "discord",
  "events",
  "general",
]

const TEAM_MEMBERSHIPS: TeamMembership[] = ["executive", "director", "top5", "other"]

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Content validation failed: ${message}`)
  }
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function expectObject(value: unknown, path: string): JsonObject {
  assert(isObject(value), `${path} must be an object`)
  return value
}

function expectString(value: unknown, path: string): string {
  assert(typeof value === "string", `${path} must be a string`)
  return value
}

function expectOptionalString(value: unknown, path: string): string | undefined {
  if (typeof value === "undefined") {
    return undefined
  }

  return expectString(value, path)
}

function expectNumber(value: unknown, path: string): number {
  assert(typeof value === "number" && Number.isFinite(value), `${path} must be a finite number`)
  return value
}

function expectStringOrNumber(value: unknown, path: string): string | number {
  if (typeof value === "string") {
    return value
  }

  return expectNumber(value, path)
}

function expectBoolean(value: unknown, path: string): boolean {
  assert(typeof value === "boolean", `${path} must be a boolean`)
  return value
}

function expectStringArray(value: unknown, path: string): string[] {
  assert(Array.isArray(value), `${path} must be an array`)
  value.forEach((item, index) => {
    assert(typeof item === "string", `${path}[${index}] must be a string`)
  })
  return [...value]
}

function expectEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string
): T {
  assert(typeof value === "string", `${path} must be a string`)
  assert(
    (allowed as readonly string[]).includes(value),
    `${path} must be one of ${allowed.join(", ")}`
  )
  return value as T
}

function expectEnumArray<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string
): T[] {
  assert(Array.isArray(value), `${path} must be an array`)
  assert(value.length > 0, `${path} must contain at least one value`)

  return value.map((item, index) =>
    expectEnum(item, allowed, `${path}[${index}]`)
  )
}

function parseEvent(value: unknown, path: string): Event {
  const raw = expectObject(value, path)
  const startDateTime = expectOptionalString(raw.startDateTime, `${path}.startDateTime`)
  const endDateTime = expectOptionalString(raw.endDateTime, `${path}.endDateTime`)
  const recurringStartTime = expectOptionalString(
    raw.recurringStartTime,
    `${path}.recurringStartTime`
  )
  const recurringEndTime = expectOptionalString(
    raw.recurringEndTime,
    `${path}.recurringEndTime`
  )
  const hasFixedSchedule = Boolean(startDateTime && endDateTime)
  const hasRecurringSchedule = Boolean(recurringStartTime && recurringEndTime)

  assert(
    hasFixedSchedule || hasRecurringSchedule,
    `${path} must include either start/end date times or recurring start/end times`
  )
  assert(
    !(hasFixedSchedule && hasRecurringSchedule),
    `${path} cannot include both fixed and recurring schedule fields`
  )

  return {
    id: expectString(raw.id, `${path}.id`),
    slug: expectString(raw.slug, `${path}.slug`),
    title: expectString(raw.title, `${path}.title`),
    description: expectString(raw.description, `${path}.description`),
    category: expectEnumArray(raw.category, EVENT_CATEGORIES, `${path}.category`),
    startDateTime,
    endDateTime,
    recurringStartTime,
    recurringEndTime,
    isRecurring: hasRecurringSchedule,
    location: expectString(raw.location, `${path}.location`),
    image: expectOptionalString(raw.image, `${path}.image`),
    imageAlt: expectOptionalString(raw.imageAlt, `${path}.imageAlt`),
    featured: expectBoolean(raw.featured, `${path}.featured`),
    registerLink: expectOptionalString(raw.registerLink, `${path}.registerLink`),
  }
}

function parseSponsor(value: unknown, path: string): Sponsor {
  const raw = expectObject(value, path)

  return {
    id: expectString(raw.id, `${path}.id`),
    name: expectString(raw.name, `${path}.name`),
    logoText: expectString(raw.logoText, `${path}.logoText`),
    websiteUrl: expectString(raw.websiteUrl, `${path}.websiteUrl`),
    tier: expectEnum(raw.tier, SPONSOR_TIERS, `${path}.tier`),
    image: expectOptionalString(raw.image, `${path}.image`),
    imageAlt: expectOptionalString(raw.imageAlt, `${path}.imageAlt`),
    discountDescription: expectString(raw.discountDescription, `${path}.discountDescription`),
    promoCode: expectOptionalString(raw.promoCode, `${path}.promoCode`),
    terms: expectString(raw.terms, `${path}.terms`),
    validUntil: expectOptionalString(raw.validUntil, `${path}.validUntil`),
  }
}

function parseFaq(value: unknown, path: string): FAQ {
  const raw = expectObject(value, path)

  return {
    id: expectString(raw.id, `${path}.id`),
    question: expectString(raw.question, `${path}.question`),
    answer: expectString(raw.answer, `${path}.answer`),
    category: expectEnum(raw.category, FAQ_CATEGORIES, `${path}.category`),
  }
}

function parseSocialLinks(value: unknown, path: string): SocialLinks {
  const raw = expectObject(value, path)

  return {
    discord: expectString(raw.discord, `${path}.discord`),
    instagram: expectString(raw.instagram, `${path}.instagram`),
    facebook: expectOptionalString(raw.facebook, `${path}.facebook`),
    youtube: expectOptionalString(raw.youtube, `${path}.youtube`),
    email: expectString(raw.email, `${path}.email`),
    linktree: expectOptionalString(raw.linktree, `${path}.linktree`),
  }
}

function parseMembershipPath(value: unknown, path: string): MembershipPath {
  const raw = expectObject(value, path)

  return {
    id: expectString(raw.id, `${path}.id`),
    label: expectString(raw.label, `${path}.label`),
    summary: expectString(raw.summary, `${path}.summary`),
    steps: expectStringArray(raw.steps, `${path}.steps`),
  }
}

function parseContact(value: unknown, path: string): Contact {
  const raw = expectObject(value, path)

  return {
    label: expectString(raw.label, `${path}.label`),
    email: expectString(raw.email, `${path}.email`),
  }
}

function parseHero(value: unknown, path: string): SiteContent["hero"] {
  const raw = expectObject(value, path)
  const primaryCta = expectObject(raw.primaryCta, `${path}.primaryCta`)
  const secondaryCta = expectObject(raw.secondaryCta, `${path}.secondaryCta`)

  return {
    title: expectString(raw.title, `${path}.title`),
    subtitle: expectOptionalString(raw.subtitle, `${path}.subtitle`),
    image: expectOptionalString(raw.image, `${path}.image`),
    imageAlt: expectOptionalString(raw.imageAlt, `${path}.imageAlt`),
    primaryCta: {
      label: expectString(primaryCta.label, `${path}.primaryCta.label`),
      href: expectString(primaryCta.href, `${path}.primaryCta.href`),
    },
    secondaryCta: {
      label: expectString(secondaryCta.label, `${path}.secondaryCta.label`),
      href: expectString(secondaryCta.href, `${path}.secondaryCta.href`),
    },
  }
}

function parseTeamProfile(value: unknown, path: string): TeamProfile {
  const raw = expectObject(value, path)

  const extrasValue = raw.extras
  const extras =
    typeof extrasValue === "undefined"
      ? undefined
      : expectStringArray(extrasValue, `${path}.extras`)

  return {
    id: expectString(raw.id, `${path}.id`),
    name: expectString(raw.name, `${path}.name`),
    role: expectString(raw.role, `${path}.role`),
    membership: expectEnum(raw.membership, TEAM_MEMBERSHIPS, `${path}.membership`),
    portfolio: expectString(raw.portfolio, `${path}.portfolio`),
    displayOrder: expectNumber(raw.displayOrder, `${path}.displayOrder`),
    pronouns: expectOptionalString(raw.pronouns, `${path}.pronouns`),
    portraitImage: expectString(raw.portraitImage, `${path}.portraitImage`),
    portraitAlt: expectString(raw.portraitAlt, `${path}.portraitAlt`),
    degree: expectStringArray(raw.degree, `${path}.degree`),
    funFacts: expectStringArray(raw.funFacts, `${path}.funFacts`),
    favoriteAnime: expectStringArray(raw.favoriteAnime, `${path}.favoriteAnime`),
    extras,
    discordHandle: expectOptionalString(raw.discordHandle, `${path}.discordHandle`),
  }
}

export function parseEvents(value: unknown): Event[] {
  const raw = expectObject(value, "events")
  assert(Array.isArray(raw.events), "events.events must be an array")
  return raw.events.map((event, index) => parseEvent(event, `events[${index}]`))
}

export function parseSponsors(value: unknown): Sponsor[] {
  assert(Array.isArray(value), "sponsors must be an array")
  return value.map((sponsor, index) => parseSponsor(sponsor, `sponsors[${index}]`))
}

export function parseFaqs(value: unknown): FAQ[] {
  assert(Array.isArray(value), "faqs must be an array")
  return value.map((faq, index) => parseFaq(faq, `faqs[${index}]`))
}

export function parseSiteContent(value: unknown): SiteContent {
  const raw = expectObject(value, "siteContent")
  const clubStats = expectObject(raw.clubStats, "siteContent.clubStats")
  assert(Array.isArray(raw.membershipPaths), "siteContent.membershipPaths must be an array")
  assert(Array.isArray(raw.contacts), "siteContent.contacts must be an array")

  return {
    clubName: expectString(raw.clubName, "siteContent.clubName"),
    hero: parseHero(raw.hero, "siteContent.hero"),
    clubDescription: expectString(raw.clubDescription, "siteContent.clubDescription"),
    eventsOverview: expectString(raw.eventsOverview, "siteContent.eventsOverview"),
    sponsorPerksOverview: expectString(
      raw.sponsorPerksOverview,
      "siteContent.sponsorPerksOverview"
    ),
    discordOverview: expectString(raw.discordOverview, "siteContent.discordOverview"),
    socialLinks: parseSocialLinks(raw.socialLinks, "siteContent.socialLinks"),
    clubStats: {
      memberCount: expectStringOrNumber(
        clubStats.memberCount,
        "siteContent.clubStats.memberCount"
      ),
      activeSince: expectStringOrNumber(
        clubStats.activeSince,
        "siteContent.clubStats.activeSince"
      ),
      eventsPerTerm: expectStringOrNumber(
        clubStats.eventsPerTerm,
        "siteContent.clubStats.eventsPerTerm"
      ),
      sponsorCount: expectStringOrNumber(
        clubStats.sponsorCount,
        "siteContent.clubStats.sponsorCount"
      ),
      lastUpdated: expectString(clubStats.lastUpdated, "siteContent.clubStats.lastUpdated"),
    },
    membershipPaths: raw.membershipPaths.map((path, index) =>
      parseMembershipPath(path, `siteContent.membershipPaths[${index}]`)
    ),
    contacts: raw.contacts.map((contact, index) =>
      parseContact(contact, `siteContent.contacts[${index}]`)
    ),
  }
}

export function parseTeamProfiles(value: unknown): TeamProfile[] {
  assert(Array.isArray(value), "teamProfiles must be an array")
  return value.map((profile, index) =>
    parseTeamProfile(profile, `teamProfiles[${index}]`)
  )
}
