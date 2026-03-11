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
})
