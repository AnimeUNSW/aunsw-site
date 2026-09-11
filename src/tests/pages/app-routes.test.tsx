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
    ).toHaveAttribute("href", "https://api.animeunsw.net/auth/discord/start")
  })
})
