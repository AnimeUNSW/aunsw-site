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

function mockApplicationAdminRequests() {
  const account = {
    attendance_history: [],
    avatar_url: null,
    discord_id: "123",
    display_name: "Executive",
    is_admin: true,
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
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith("/v1/me")) {
        return Promise.resolve(
          new Response(JSON.stringify(account), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      }
      if (url.endsWith("/v1/admin/applications/forms")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              version: 1,
              updated_at: "2026-09-27T00:00:00Z",
              locked: false,
              questions: [],
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          )
        )
      }
      if (url.endsWith("/v1/admin/applications/windows")) {
        return Promise.resolve(
          new Response(JSON.stringify({ windows: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      }
      return Promise.reject(new Error(`Unexpected request: ${url}`))
    })
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

  it("shows Discord sign in on the public application route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
    )

    renderRoute("/apply")

    expect(
      await screen.findByRole("heading", { name: "Continue with Discord" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Sign in with Discord" })
    ).toHaveAttribute(
      "href",
      "https://api.animeunsw.net/auth/discord/start?return_to=http%3A%2F%2Flocalhost%3A3000%2Fapply"
    )
  })

  it("locks an application after submission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              window: {
                id: "window-1",
                name: "2027 Directors",
                application_type: "director",
                opened_at: "2026-09-01T00:00:00Z",
                questions: [],
              },
              draft: null,
              verified_email: "z5555555@ad.unsw.edu.au",
              history: [
                {
                  id: "application-1",
                  window_id: "window-1",
                  status: "submitted",
                  submitted_at: "2026-09-20T04:30:00Z",
                  withdrawn_at: null,
                  full_name: "Ollie Member",
                  preferred_name: "Ollie",
                  year_of_study: "3",
                  membership_number: "1234",
                  portfolios: ["it"],
                  answers: {},
                  confirmation_email: null,
                  email_opt_in: false,
                },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
      )
    )

    renderRoute("/apply")

    expect(
      await screen.findByRole("heading", { name: "Application submitted" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Withdraw application" })
    ).toBeInTheDocument()
    expect(screen.queryByRole("textbox", { name: /full name/i })).toBeNull()
  })

  it("shows team applications to the designated Executive account", async () => {
    const account = {
      attendance_history: [],
      avatar_url: null,
      discord_id: "419431549797269504",
      display_name: "Executive",
      is_admin: true,
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
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith("/v1/me")) {
        return Promise.resolve(
          new Response(JSON.stringify(account), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      }
      if (url.endsWith("/v1/admin/events")) {
        return Promise.resolve(
          new Response(JSON.stringify({ events: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      }
      return Promise.reject(new Error(`Unexpected request: ${url}`))
    })
    vi.stubGlobal("fetch", fetchMock)

    renderRoute("/admin")

    expect(
      await screen.findByRole("link", { name: "Manage Events" })
    ).toHaveAttribute("href", "/admin/events")
    expect(
      screen.getByRole("link", { name: "Manage Meet the Team" })
    ).toHaveAttribute("href", "/admin/team")
    expect(
      screen.getByRole("link", { name: "Manage Team Applications" })
    ).toHaveAttribute("href", "/admin/applications")
    expect(
      screen.queryByRole("button", { name: "Add event" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Access denied" })
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole("link", { name: "Admin" }).length
    ).toBeGreaterThan(0)
  })

  it("shows application administration as two large page links", async () => {
    mockApplicationAdminRequests()

    renderRoute("/admin/applications")

    expect(
      await screen.findByRole("link", { name: "Open Form Editor" })
    ).toHaveAttribute("href", "/admin/applications/forms")
    expect(
      screen.getByRole("link", { name: "View Applications" })
    ).toHaveAttribute("href", "/admin/applications/responses")
  })

  it("renders the application form editor on its own page", async () => {
    mockApplicationAdminRequests()

    renderRoute("/admin/applications/forms")

    expect(
      await screen.findByRole("heading", { name: "Application form editor" })
    ).toBeInTheDocument()
    expect(screen.getByText("Shared form template")).toBeInTheDocument()
  })

  it("renders submitted applications on their own page", async () => {
    mockApplicationAdminRequests()

    renderRoute("/admin/applications/responses")

    expect(
      await screen.findByRole("heading", { name: "View applications" })
    ).toBeInTheDocument()
    expect(
      screen.getByText("No application windows have been published yet.")
    ).toBeInTheDocument()
  })

  it("allows a Director without the Executive role to open the admin URL", async () => {
    const account = {
      attendance_history: [],
      avatar_url: null,
      discord_id: "456",
      display_name: "Director",
      is_admin: true,
      is_executive: false,
      username: "director",
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
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.endsWith("/v1/me")) {
          return Promise.resolve(
            new Response(JSON.stringify(account), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          )
        }
        if (url.endsWith("/v1/admin/events")) {
          return Promise.resolve(
            new Response(JSON.stringify({ events: [] }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          )
        }
        return Promise.reject(new Error(`Unexpected request: ${url}`))
      })
    )

    renderRoute("/admin")

    expect(
      await screen.findByRole("link", { name: "Manage Events" })
    ).toHaveAttribute("href", "/admin/events")
    expect(
      screen.getAllByRole("link", { name: "Admin" }).length
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole("heading", { name: "Access denied" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: "Manage Team Applications" })
    ).not.toBeInTheDocument()
  })

  it("renders event management on its own admin route", async () => {
    const account = {
      attendance_history: [],
      avatar_url: null,
      discord_id: "789",
      display_name: "Executive",
      is_admin: true,
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
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.endsWith("/v1/me")) {
          return Promise.resolve(
            new Response(JSON.stringify(account), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          )
        }
        if (url.endsWith("/v1/admin/events")) {
          return Promise.resolve(
            new Response(JSON.stringify({ events: [] }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          )
        }
        return Promise.reject(new Error(`Unexpected request: ${url}`))
      })
    )

    renderRoute("/admin/events")

    expect(
      await screen.findByRole("heading", { name: "Manage events" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Add event" })
    ).toBeInTheDocument()
  })
})
