import { describe, expect, it } from "vitest"
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
  it("renders home page", () => {
    renderRoute("/")
    // logo should be present and use the new purple_logo.gif asset
    const logo = screen.getByRole("img", { name: /animeunsw logo/i })
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute("src", expect.stringContaining("purple_logo.gif"))

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
})
