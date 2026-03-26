import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"

import { EventCard } from "@/components/events/event-card"
import { getEvents } from "@/lib/content-repository"
import { renderWithProviders } from "@/tests/render-with-providers"

describe("EventCard", () => {
  it("shows event metadata", () => {
    const [event] = getEvents()

    if (!event) {
      throw new Error("Expected event data")
    }

    renderWithProviders(<EventCard event={event} />)

    expect(
      screen.getByRole("heading", { name: event.title })
    ).toBeInTheDocument()
    expect(screen.getByText(event.location)).toBeInTheDocument()
  })

  it("shows a recurring badge for recurring events", () => {
    const recurringEvent = getEvents().find((event) => event.isRecurring)

    if (!recurringEvent) {
      throw new Error("Expected a recurring event in test data")
    }

    renderWithProviders(<EventCard event={recurringEvent} />)

    expect(screen.getByText("Weekly")).toBeInTheDocument()
  })

  it("auto-adds Past Events badge when event end time has already passed", () => {
    const pastEvent = {
      id: "evt-past-test",
      slug: "past-test",
      title: "Past test event",
      description: "This event happened already.",
      category: ["weekly"],
      startDateTime: "2010-01-01T10:00:00.000Z",
      endDateTime: "2010-01-01T12:00:00.000Z",
      location: "Test Venue",
      featured: false,
    }

    renderWithProviders(<EventCard event={pastEvent} />)

    expect(screen.getByText("Past Events")).toBeInTheDocument()
  })

  it("disables Register button for past events", () => {
    const pastEvent = {
      id: "evt-past-test-2",
      slug: "past-test-2",
      title: "Past test event 2",
      description: "This event happened already.",
      category: ["collab"],
      startDateTime: "2010-01-01T10:00:00.000Z",
      endDateTime: "2010-01-01T12:00:00.000Z",
      location: "Test Venue",
      featured: false,
      registerLink: "https://campus.hellorubric.com",
    }

    renderWithProviders(<EventCard event={pastEvent} />)

    expect(screen.getByRole("button", { name: /register/i })).toBeDisabled()
  })
})
