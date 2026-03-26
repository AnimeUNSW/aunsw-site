import type { Event } from "@/types/content"

export function isEventPast(event: Event): boolean {
  const dateString = event.endDateTime ?? event.startDateTime

  if (!dateString) {
    return false
  }

  const eventDate = new Date(dateString)

  if (Number.isNaN(eventDate.getTime())) {
    return false
  }

  return eventDate.getTime() < Date.now()
}

export function withPastCategory(event: Event): Event {
  if (!isEventPast(event) || event.category.includes("past")) {
    return event
  }

  return {
    ...event,
    category: [...event.category, "past"],
  }
}
