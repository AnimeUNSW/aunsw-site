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

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

function parseRecurringDayTime(value: string) {
  const match = value.match(
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(\d{2}):(\d{2})$/i
  )

  if (!match) {
    throw new Error(
      `Invalid recurring event time "${value}". Expected format like "thursday 13:00".`
    )
  }

  const [, weekday, hours, minutes] = match

  return {
    weekday: WEEKDAY_INDEX[weekday.toLowerCase()],
    hours: Number(hours),
    minutes: Number(minutes),
  }
}

function getNextRecurringDate(value: string, now = new Date()) {
  const { weekday, hours, minutes } = parseRecurringDayTime(value)
  const next = new Date(now)

  next.setSeconds(0, 0)
  next.setHours(hours, minutes, 0, 0)

  const dayOffset = (weekday - next.getDay() + 7) % 7
  next.setDate(next.getDate() + dayOffset)

  if (dayOffset === 0 && next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 7)
  }

  return next
}

function hydrateRecurringEvents(events: Event[]) {
  return events.map((event) => {
    if (!event.recurringStartTime || !event.recurringEndTime) {
      return event
    }

    const startDate = getNextRecurringDate(event.recurringStartTime)
    let endDate = getNextRecurringDate(event.recurringEndTime, startDate)

    if (endDate.getTime() <= startDate.getTime()) {
      endDate = new Date(endDate)
      endDate.setDate(endDate.getDate() + 7)
    }

    return {
      ...event,
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      isRecurring: true,
    }
  })
}

function sortEvents(events: Event[]) {
  return [...events].sort((left, right) => {
    const now = Date.now()
    const leftDate = new Date(left.startDateTime ?? 0).getTime()
    const rightDate = new Date(right.startDateTime ?? 0).getTime()
    const leftIsUpcoming = leftDate >= now
    const rightIsUpcoming = rightDate >= now

    if (leftIsUpcoming !== rightIsUpcoming) {
      return leftIsUpcoming ? -1 : 1
    }

    if (leftIsUpcoming && rightIsUpcoming) {
      return leftDate - rightDate
    }

    return rightDate - leftDate
  })
}

function sortTeamProfiles(profiles: TeamProfile[]) {
  return [...profiles].sort(
    (left, right) => left.displayOrder - right.displayOrder
  )
}

const events = sortEvents(hydrateRecurringEvents(parseEvents(eventsData)))
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
