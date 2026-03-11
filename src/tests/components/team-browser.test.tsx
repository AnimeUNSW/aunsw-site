import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { TeamBrowser } from "@/components/team/team-browser"
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
    portraitImage: "",
    portraitAlt: "",
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

  it("resets timer when user manually navigates", async () => {
    const profiles = [makeProfile("a"), makeProfile("b")]
    const user = userEvent.setup()

    render(<TeamBrowser profiles={profiles} />)

    // initially showing first profile
    expect(screen.getByText(/person a/i)).toBeInTheDocument()

    // advance most of autoplay interval without flipping
    vi.advanceTimersByTime(AUTOPLAY_MS - 100)
    expect(screen.getByText(/person a/i)).toBeInTheDocument()

    // manual "next" click should change profile
    await user.click(screen.getByRole("button", { name: /next/i }))
    expect(screen.getByText(/person b/i)).toBeInTheDocument()

    // if timer hadn't reset, it would flip soonest at 100ms from now
    // with reset it should wait full AUTOPLAY_MS again
    vi.advanceTimersByTime(AUTOPLAY_MS - 100)
    expect(screen.getByText(/person b/i)).toBeInTheDocument()

    // now let remaining time pass and expect it to auto-advance
    vi.advanceTimersByTime(100)
    expect(screen.getByText(/person a/i)).toBeInTheDocument()
  })

  it("jumps to the portfolio lead when a portfolio chip is clicked", async () => {
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
    const user = userEvent.setup()

    render(<TeamBrowser profiles={profiles} />)

    await user.click(screen.getByRole("button", { name: "Creatives" }))

    expect(screen.getByText(/eri/i)).toBeInTheDocument()
  })
})
