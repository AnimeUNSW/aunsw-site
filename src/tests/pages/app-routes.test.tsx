import { afterEach, describe, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"

import { AppRoutes } from "@/app/app-routes"
import { AppShell } from "@/components/layout/app-shell"
import { renderWithProviders } from "@/tests/render-with-providers"

function renderRoute(route: string) {
  return renderWithProviders(
    <AppShell>
      <AppRoutes />
    </AppShell>,
    { route }
  )
}

describe("app routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders home page", () => {
    renderRoute("/")
    const arcLogo = screen.getByRole("img", { name: /arc logo/i })
    expect(arcLogo).toBeInTheDocument()
    expect(arcLogo).toHaveAttribute(
      "src",
      expect.stringContaining("arc-logo.webp")
    )

    const animeLogo = screen.getByRole("img", { name: /animeunsw logo/i })
    expect(animeLogo).toBeInTheDocument()
    expect(animeLogo).toHaveAttribute(
      "src",
      expect.stringContaining("purple_logo.gif")
    )

    expect(
      screen.getByRole("heading", {
        name: /anime nights, socials, and community on campus/i,
      })
    ).toBeInTheDocument()
  })

  it("renders events page", () => {
    renderRoute("/events")
    expect(screen.getByRole("heading", { name: "Events" })).toBeInTheDocument()
  })

  it("renders sponsors page", () => {
    renderRoute("/sponsors")
    expect(
      screen.getByRole("heading", { name: "Sponsors" })
    ).toBeInTheDocument()
  })

  it("renders info page", () => {
    renderRoute("/info")
    expect(screen.getByRole("heading", { name: "Info" })).toBeInTheDocument()
  })

  it("renders meet the team page", () => {
    renderRoute("/team")
    expect(
      screen.getByRole("heading", { name: "Meet the Team" })
    ).toBeInTheDocument()
  })

  it("renders account sign in for a logged-out visitor", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
    )

    renderRoute("/account")

    expect(
      await screen.findByRole("heading", { name: "Continue with Discord" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Sign in with Discord" })
    ).toHaveAttribute(
      "href",
      "https://api.animeunsw.net/auth/discord/start?return_to=http%3A%2F%2Flocalhost%3A3000%2Faccount"
    )
  })

  it("blocks a direct admin URL for logged-out visitors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
    )

    renderRoute("/admin")

    expect(
      await screen.findByRole("heading", { name: "Access denied" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Add event" })
    ).not.toBeInTheDocument()
  })

  it("shows the admin dashboard only for an Executive account", async () => {
    const account = {
      avatar_url: null,
      discord_id: "123",
      display_name: "Executive",
      is_executive: true,
      username: "exec",
      stats: {
        anilist_profile: null,
        events_attended: 0,
        exp: 0,
        mal_profile: null,
        message_count: 0,
        quote: null,
        rank: null,
        term_exp: 0,
      },
    }
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify(account), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ events: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
    )

    renderRoute("/admin")

    expect(
      await screen.findByRole("button", { name: "Add event" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Access denied" })
    ).not.toBeInTheDocument()
  })
})
