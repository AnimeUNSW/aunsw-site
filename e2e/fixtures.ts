import { test as base, expect } from "@playwright/test"
import type { Account } from "../src/lib/account-api"
import type { AdminEvent } from "../src/lib/admin-api"
import type {
  ApplicationDraft,
  ApplicationFormTemplate,
  ApplicationRecord,
  ApplicationWindow,
  InterviewPlan,
} from "../src/lib/applications-api"
import type { TeamProfile } from "../src/types/content"

const now = "2026-10-22T00:00:00.000Z"

export function makeAccount(): Account {
  return {
    discord_id: "419431549797269504",
    display_name: "Test Committee",
    username: "test_committee",
    avatar_url: null,
    is_admin: true,
    is_executive: true,
    profile: {
      first_name: "Test",
      last_name: "Committee",
      zid: null,
      email: null,
      phone_number: null,
    },
    stats: {
      message_count: 12,
      exp: 150,
      rank: 2,
      events_attended: 1,
      term_exp: 50,
      quote: "Test quote",
      mal_profile: null,
      anilist_profile: null,
    },
    attendance_history: [],
  }
}

export function makeEvent(): AdminEvent {
  return {
    id: "test-event",
    slug: "test-event",
    title: "Test Movie Night",
    description: "A fictional screening used by automated tests.",
    category: ["weekly"],
    startDateTime: "2026-10-29T07:00:00Z",
    endDateTime: "2026-10-29T09:00:00Z",
    location: "Test Room",
    image: "/favicon.svg",
    featured: true,
    attendanceCount: 1,
    attendanceUploads: [
      {
        id: "test-upload",
        fileName: "existing.csv",
        importedAt: now,
        attendanceCount: 1,
      },
    ],
  }
}

const applicationWindow: ApplicationWindow = {
  id: "test-window",
  name: "Test recruitment",
  application_type: "director",
  status: "open",
  opened_at: now,
  questions: [
    {
      id: "motivation",
      section: "it",
      fixed_key: null,
      question_text: "Why IT?",
      answer_type: "long_text",
      required: true,
      min_length: null,
      max_length: null,
      allow_multiple: false,
      display_order: 0,
      options: [],
    },
  ],
}

export interface ApiState {
  account: Account | null
  events: AdminEvent[]
  team: TeamProfile[]
  draft: ApplicationDraft | null
  history: ApplicationRecord[]
  window: ApplicationWindow
  forms: ApplicationFormTemplate
  plan: InterviewPlan
  requests: { method: string; path: string; body: string | null }[]
  failures: Record<string, { status: number; detail: string }>
}

export const test = base.extend<{ api: ApiState }>({
  api: async ({ context, page }, provide) => {
    const account = makeAccount()
    const api: ApiState = {
      account,
      events: [makeEvent()],
      team: [],
      draft: null,
      history: [],
      window: structuredClone(applicationWindow),
      forms: { version: 1, updated_at: now, locked: false, questions: [] },
      plan: {
        window: structuredClone(applicationWindow),
        viewer_discord_id: account.discord_id,
        timezone: "Australia/Sydney",
        duration_minutes: 30,
        panel_size: 2,
        interviewers: [
          {
            discord_id: account.discord_id,
            name: account.display_name,
            username: account.username,
            portfolios: ["it"],
            team_names: ["Test Committee"],
            linked: true,
            slots: [],
            updated_at: null,
          },
        ],
        recommendations: [],
        summary: { applicants: 0, recommended: 0, unmatched: 0 },
      },
      requests: [],
      failures: {},
    }
    const unexpected: string[] = []
    const pageErrors: string[] = []
    page.on("pageerror", (error) => pageErrors.push(error.message))
    await page.clock.setFixedTime(new Date(now))
    // Every external request is intercepted. Tests cannot call the live API,
    // Discord, send email, or change a real GitHub content file.
    await context.route("**/*", async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      if (url.hostname === "127.0.0.1") return route.continue()
      const path = url.pathname
      const method = request.method()
      const reply = (json: unknown, status = 200) =>
        route.fulfill({ status, json })
      if (!path.startsWith("/v1/") && path !== "/auth/logout") {
        unexpected.push(`${method} ${url.origin}${path}`)
        return route.abort()
      }
      api.requests.push({ method, path, body: request.postData() })
      if (api.failures[path])
        return reply(
          { detail: api.failures[path].detail },
          api.failures[path].status
        )
      if (path === "/v1/me")
        return api.account ? reply(api.account) : reply({}, 401)
      if (path === "/v1/leaderboard") {
        if (!api.account) return reply({}, 401)
        const page = Number(url.searchParams.get("page"))
        return reply({
          sort: url.searchParams.get("sort"),
          viewer_discord_id: account.discord_id,
          page,
          page_size: 25,
          total_entries: 26,
          total_pages: 2,
          entries: [
            {
              rank: page === 1 ? 1 : 26,
              discord_id: account.discord_id,
              username: account.username,
              display_name:
                page === 1 ? "First page member" : "Second page member",
              avatar_url: null,
              xp: 150,
              events_attended: 1,
            },
          ],
        })
      }
      if (path === "/v1/me/profile" && api.account) {
        const value = request.postDataJSON() as Record<string, string | null>
        Object.assign(api.account.profile, {
          first_name: value.first_name,
          last_name: value.last_name,
          phone_number: value.phone_number,
        })
        Object.assign(api.account.stats, {
          quote: value.quote,
          mal_profile: value.mal_profile,
          anilist_profile: value.anilist_profile,
        })
        return reply(api.account)
      }
      if (path === "/auth/logout") {
        api.account = null
        return reply({})
      }
      if (path === "/v1/admin/events" && method === "GET")
        return reply({ events: api.events })
      if (path === "/v1/admin/events" && method === "POST") {
        const event = {
          ...request.postDataJSON(),
          id: "new-event",
          attendanceCount: 0,
          attendanceUploads: [],
        } as AdminEvent
        api.events.push(event)
        return reply(event)
      }
      if (path === "/v1/admin/event-images" || path === "/v1/admin/team-images")
        return reply({ image: "/favicon.svg", portraitImage: "/favicon.svg" })
      const attendance = path.match(
        /^\/v1\/admin\/events\/([^/]+)\/attendance(?:\/([^/]+))?$/
      )
      if (attendance) {
        const event = api.events.find((item) => item.id === attendance[1])!
        if (method === "POST") {
          event.attendanceCount += 1
          const fileName = url.searchParams.get("filename")!
          event.attendanceUploads.unshift({
            id: "new-upload",
            fileName,
            importedAt: now,
            attendanceCount: 1,
          })
          return reply({
            total_rows: 1,
            unique_valid_zids: 1,
            duplicate_rows: 0,
            placeholder_rows: 0,
            invalid_rows: 0,
            matched_users: 1,
            newly_recorded: 1,
            already_recorded: 0,
            unmatched_zids: 0,
            ambiguous_zids: 0,
            upload_id: "new-upload",
            imported_at: now,
            file_name: fileName,
            xp_awarded: 10,
          })
        }
        if (method === "DELETE") {
          const upload = event.attendanceUploads.find(
            (item) => item.id === attendance[2]
          )!
          event.attendanceCount -= upload.attendanceCount
          event.attendanceUploads = event.attendanceUploads.filter(
            (item) => item.id !== upload.id
          )
          return reply({ removed: upload.attendanceCount })
        }
      }
      const eventId = path.match(/^\/v1\/admin\/events\/([^/]+)$/)?.[1]
      if (eventId && method === "PUT") {
        api.events = api.events.map((item) =>
          item.id === eventId
            ? ({ ...item, ...request.postDataJSON() } as AdminEvent)
            : item
        )
        return reply(api.events.find((item) => item.id === eventId))
      }
      if (eventId && method === "DELETE") {
        api.events = api.events.filter((item) => item.id !== eventId)
        return route.fulfill({ status: 204 })
      }
      if (path === "/v1/admin/team" && method === "GET")
        return reply({ profiles: api.team })
      if (path === "/v1/admin/team" && method === "POST") {
        const profile = {
          ...request.postDataJSON(),
          id: "new-profile",
        } as TeamProfile
        api.team.push(profile)
        return reply(profile)
      }
      const profileId = path.match(/^\/v1\/admin\/team\/([^/]+)$/)?.[1]
      if (profileId && method === "PUT") {
        api.team = api.team.map((item) =>
          item.id === profileId
            ? ({ ...item, ...request.postDataJSON() } as TeamProfile)
            : item
        )
        return reply(api.team.find((item) => item.id === profileId))
      }
      if (profileId && method === "DELETE") {
        api.team = api.team.filter((item) => item.id !== profileId)
        return route.fulfill({ status: 204 })
      }
      if (path === "/v1/admin/members")
        return reply({
          query: url.searchParams.get("q"),
          page: 1,
          page_size: 20,
          total_entries: 1,
          total_pages: 1,
          members: [
            {
              ...account,
              in_server: true,
              profile: { ...account.profile, membership_type: "member" },
            },
          ],
        })
      if (path === "/v1/applications/current" && !api.account)
        return reply({}, 401)
      if (path === "/v1/applications/current")
        return reply({
          window: api.window,
          draft: api.draft,
          history: api.history,
          verified_email: null,
        })
      if (path === "/v1/applications/current/draft") {
        api.draft = request.postDataJSON() as ApplicationDraft
        return reply({ id: "test-draft", saved_at: now })
      }
      if (path === "/v1/applications/current/submit") {
        api.history.unshift({
          ...request.postDataJSON(),
          id: "test-application",
          window_id: api.window.id,
          status: "submitted",
          submitted_at: now,
          withdrawn_at: null,
        } as ApplicationRecord)
        return reply({
          id: "test-application",
          submitted_at: now,
          email_sent: false,
        })
      }
      if (path === "/v1/applications/test-application/withdraw") {
        api.history[0].status = "withdrawn"
        return reply({ status: "withdrawn" })
      }
      if (path === "/v1/admin/applications/forms") {
        if (method === "PUT")
          api.forms = {
            ...api.forms,
            ...request.postDataJSON(),
            version: api.forms.version + 1,
          } as ApplicationFormTemplate
        return reply(api.forms)
      }
      if (path === "/v1/admin/applications/windows" && method === "POST") {
        api.window = {
          ...api.window,
          ...request.postDataJSON(),
          status: "open",
          questions: structuredClone(api.forms.questions),
        } as ApplicationWindow
        api.forms.locked = true
        return reply(api.window)
      }
      if (path === "/v1/admin/applications/windows/test-window/close") {
        api.window.status = "closed"
        api.forms.locked = false
        return reply({ status: "closed" })
      }
      if (path === "/v1/admin/applications/windows")
        return reply({ windows: [api.window] })
      if (path.endsWith("/interviews/availability")) {
        const { slots } = request.postDataJSON() as { slots: string[] }
        api.plan.interviewers[0].slots = slots
        return reply({ slots })
      }
      if (path.endsWith("/interviews"))
        return reply({
          ...api.plan,
          duration_minutes: Number(url.searchParams.get("duration_minutes")),
          panel_size: Number(url.searchParams.get("panel_size")),
        })
      if (path === "/v1/admin/applications/windows/test-window")
        return reply({
          window: api.window,
          questions: api.window.questions,
          applications: api.history,
        })
      unexpected.push(`${method} ${path}`)
      return reply({ detail: `Unhandled test request: ${method} ${path}` }, 500)
    })
    await provide(api)
    expect(
      unexpected,
      "All external requests must have explicit test fixtures"
    ).toEqual([])
    expect(pageErrors, "No uncaught browser errors").toEqual([])
  },
})

export { expect } from "@playwright/test"
