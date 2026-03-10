import eventsData from "@/data/events.json"
import faqData from "@/data/faq.json"
import siteData from "@/data/site.json"
import sponsorsData from "@/data/sponsors.json"
import teamData from "@/data/team.json"
import {
  parseEvents,
  parseFaqs,
  parseSiteContent,
  parseSponsors,
  parseTeamProfiles,
} from "@/lib/content-validation"
import type {
  ContentRepository,
  Event,
  TeamProfile,
} from "@/types/content"

function sortEvents(events: Event[]) {
  return [...events].sort((left, right) => {
    const leftDate = new Date(left.startDateTime).getTime()
    const rightDate = new Date(right.startDateTime).getTime()

    return leftDate - rightDate
  })
}

function sortTeamProfiles(profiles: TeamProfile[]) {
  return [...profiles].sort(
    (left, right) => left.displayOrder - right.displayOrder
  )
}

const events = sortEvents(parseEvents(eventsData))
const sponsors = parseSponsors(sponsorsData)
const faqs = parseFaqs(faqData)
const siteContent = parseSiteContent(siteData)
const teamProfiles = sortTeamProfiles(parseTeamProfiles(teamData))

const repository: ContentRepository = {
  getEvents: () => [...events],
  getSponsors: () => [...sponsors],
  getFaqs: () => [...faqs],
  getSiteContent: () => ({ ...siteContent }),
  getTeamProfiles: () => [...teamProfiles],
}

export function getEvents() {
  return repository.getEvents()
}

export function getFeaturedEvents(limit = 3) {
  return repository
    .getEvents()
    .filter((event) => event.featured)
    .slice(0, limit)
}

export function getSponsors() {
  return repository.getSponsors()
}

export function getFaqs() {
  return repository.getFaqs()
}

export function getSiteContent() {
  return repository.getSiteContent()
}

export function getTeamProfiles() {
  return repository.getTeamProfiles()
}

export function getContentRepository() {
  return repository
}
