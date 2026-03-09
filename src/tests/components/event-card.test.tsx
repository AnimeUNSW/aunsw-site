import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"

import { EventCard } from "@/components/events/event-card"
import { getEvents } from "@/lib/content-repository"
import { renderWithProviders } from "@/tests/render-with-providers"

describe("EventCard", () => {
  it("shows event metadata and tags", () => {
    const [event] = getEvents()

    if (!event) {
      throw new Error("Expected event data")
    }

    renderWithProviders(<EventCard event={event} />)

    expect(
      screen.getByRole("heading", { name: event.title })
    ).toBeInTheDocument()
    expect(screen.getByText(event.location)).toBeInTheDocument()

    for (const tag of event.tags) {
      expect(screen.getByText(tag)).toBeInTheDocument()
    }
  })
})
