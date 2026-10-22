import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { act, fireEvent, screen } from "@testing-library/react"

import { TeamBrowser } from "@/components/team/team-browser"
import { renderWithProviders } from "@/tests/render-with-providers"
import type { TeamProfile } from "@/types/content"

const AUTOPLAY_MS = 6500

function makeProfile(id: string): TeamProfile {
  return {
    id,
    name: `Person ${id}`,
    role: "",
    membership: "executive",
    portfolio: `Portfolio ${id}`,
    displayOrder: 0,
    pronouns: "they/them",
    portraitImage: "/favicon.svg",
    portraitAlt: `Person ${id}`,
    degree: [],
    funFacts: [],
    favoriteAnime: [],
  }
}

describe("TeamBrowser autoplay reset", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("resets timer when user manually navigates", () => {
    const profiles = [makeProfile("a"), makeProfile("b")]

    renderWithProviders(<TeamBrowser profiles={profiles} />)

    // initially showing first profile
    expect(
      screen.getByRole("heading", { name: "Person a" })
    ).toBeInTheDocument()

    // advance most of autoplay interval without flipping
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS - 100))
    expect(
      screen.getByRole("heading", { name: "Person a" })
    ).toBeInTheDocument()

    // manual "next" click should change profile
    fireEvent.click(screen.getByRole("button", { name: /next/i }))
    expect(
      screen.getByRole("heading", { name: "Person b" })
    ).toBeInTheDocument()

    // if timer hadn't reset, it would flip soonest at 100ms from now
    // with reset it should wait full AUTOPLAY_MS again
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS - 100))
    expect(
      screen.getByRole("heading", { name: "Person b" })
    ).toBeInTheDocument()

    // now let remaining time pass and expect it to auto-advance
    act(() => vi.advanceTimersByTime(100))
    expect(
      screen.getByRole("heading", { name: "Person a" })
    ).toBeInTheDocument()
  })

  it("jumps to the portfolio lead when a portfolio chip is clicked", () => {
    const profiles: TeamProfile[] = [
      {
        ...makeProfile("top5"),
        name: "Aurelia",
        portfolio: "Top 5",
        membership: "top5",
        displayOrder: 0,
      },
      {
        ...makeProfile("creative-director"),
        name: "Miranda",
        portfolio: "Creatives",
        membership: "director",
        displayOrder: 1,
      },
      {
        ...makeProfile("creative-exec"),
        name: "Eri",
        portfolio: "Creatives",
        membership: "executive",
        displayOrder: 2,
      },
    ]

    renderWithProviders(<TeamBrowser profiles={profiles} />)

    fireEvent.click(screen.getByRole("button", { name: "Creatives" }))

    expect(screen.getByRole("heading", { name: "Eri" })).toBeInTheDocument()
  })
})
