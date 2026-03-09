import cosplayBlogData from "@/data/cosplay-blog.json"
import eventsData from "@/data/events.json"
import faqData from "@/data/faq.json"
import siteData from "@/data/site.json"
import sponsorsData from "@/data/sponsors.json"
import teamData from "@/data/team.json"
import type {
  CosplayBlogEntry,
  ContentRepository,
  Event,
  FAQ,
  SiteContent,
  Sponsor,
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

const repository: ContentRepository = {
  getEvents: () => sortEvents(eventsData as Event[]),
  getSponsors: () => sponsorsData as Sponsor[],
  getFaqs: () => faqData as FAQ[],
  getSiteContent: () => siteData as SiteContent,
  getCosplayBlogEntries: () => cosplayBlogData as CosplayBlogEntry[],
  getTeamProfiles: () => sortTeamProfiles(teamData as TeamProfile[]),
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

export function getCosplayBlogEntries() {
  return repository.getCosplayBlogEntries()
}

export function getTeamProfiles() {
  return repository.getTeamProfiles()
}

export function getContentRepository() {
  return repository
}
