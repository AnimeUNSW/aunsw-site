import { afterEach, describe, expect, it, vi } from "vitest"

import { sortEvents } from "@/lib/content-repository"
import type { Event } from "@/types/content"

function createEvent(
  id: string,
  startDateTime: string,
  options: Partial<Pick<Event, "featured" | "category">> = {}
): Event {
  return {
    id,
    slug: id,
    title: id,
    description: id,
    category: options.category ?? ["competition"],
    startDateTime,
    endDateTime: startDateTime,
    location: "Test Location",
    featured: options.featured ?? false,
  }
}

describe("sortEvents", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("orders featured, upcoming, then past events by closeness to now", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-03-12T12:00:00.000Z"))

    const events = [
      createEvent("past-far", "2026-03-01T12:00:00.000Z"),
      createEvent("upcoming-close", "2026-03-12T13:00:00.000Z"),
      createEvent("featured-far", "2026-03-20T12:00:00.000Z", {
        featured: true,
      }),
      createEvent("past-close", "2026-03-12T10:00:00.000Z"),
      createEvent("featured-close", "2026-03-12T12:30:00.000Z", {
        featured: true,
      }),
      createEvent("upcoming-far", "2026-03-14T12:00:00.000Z"),
    ]

    expect(sortEvents(events).map((event) => event.id)).toEqual([
      "featured-close",
      "featured-far",
      "upcoming-close",
      "upcoming-far",
      "past-close",
      "past-far",
    ])
  })
})
