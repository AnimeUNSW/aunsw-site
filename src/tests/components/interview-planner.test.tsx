import { fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { InterviewPlanner } from "@/components/applications/interview-planner"
import {
  getInterviewPlan,
  saveInterviewAvailability,
  type InterviewPlan,
} from "@/lib/applications-api"
import { renderWithProviders } from "@/tests/render-with-providers"

vi.mock("@/lib/applications-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/applications-api")>()),
  getInterviewPlan: vi.fn(),
  saveInterviewAvailability: vi.fn(),
}))

const plan: InterviewPlan = {
  window: {
    id: "window-1",
    name: "Recruitment",
    status: "open",
    application_type: "director",
    opened_at: "2026-10-11T00:00:00Z",
  },
  viewer_discord_id: "111",
  timezone: "Australia/Sydney",
  duration_minutes: 30,
  panel_size: 2,
  interviewers: [
    {
      discord_id: "111",
      name: "Exec",
      username: "exec",
      portfolios: ["it"],
      team_names: ["Exec"],
      linked: true,
      slots: ["mon-09:00"],
      updated_at: null,
    },
  ],
  recommendations: [
    {
      id: "app",
      discord_id: "999",
      name: "Applicant",
      portfolios: ["it"],
      status: "unmatched",
      reason: "No shared block with two interviewers.",
      day: null,
      start: null,
      end: null,
      matched_portfolios: [],
      interviewers: [],
    },
  ],
  summary: { applicants: 1, recommended: 0, unmatched: 1 },
}

describe("interview planner", () => {
  beforeEach(() => {
    vi.mocked(getInterviewPlan).mockResolvedValue(plan)
    vi.mocked(saveInterviewAvailability).mockResolvedValue({ slots: [] })
  })
  afterEach(() => vi.clearAllMocks())

  it("lets the signed-in admin save only their own availability and refreshes recommendations", async () => {
    renderWithProviders(<InterviewPlanner windowId="window-1" />)
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit availability" })
    )
    fireEvent.click(
      screen.getByRole("gridcell", { name: "Monday, 9:30 am to 10:00 am" }),
      { detail: 0 }
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Save my availability" })
    )
    await waitFor(() =>
      expect(saveInterviewAvailability).toHaveBeenCalledWith("window-1", [
        "mon-09:00",
        "mon-09:30",
      ])
    )
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Your interview availability was saved"
    )
    expect(getInterviewPlan).toHaveBeenCalledTimes(2)
  })

  it("preserves unsaved selections when panel settings change", async () => {
    renderWithProviders(<InterviewPlanner windowId="window-1" />)
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit availability" })
    )
    const cell = screen.getByRole("gridcell", {
      name: "Monday, 9:30 am to 10:00 am",
    })
    fireEvent.click(cell, { detail: 0 })
    fireEvent.change(screen.getByRole("combobox", { name: "Panel size" }), {
      target: { value: "1" },
    })
    await waitFor(() =>
      expect(getInterviewPlan).toHaveBeenCalledWith(
        "window-1",
        30,
        1,
        expect.any(AbortSignal)
      )
    )
    expect(cell).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText(/Unsaved changes/)).toBeInTheDocument()
  })

  it("clears availability explicitly and offers portfolio linking for unlinked admins", async () => {
    vi.mocked(getInterviewPlan).mockResolvedValue({
      ...plan,
      interviewers: [
        { ...plan.interviewers[0], linked: false, portfolios: [] },
      ],
    })
    renderWithProviders(<InterviewPlanner windowId="window-1" />)
    expect(
      await screen.findByRole("link", { name: /link your discord user id/i })
    ).toHaveAttribute("href", "/admin/team")
    fireEvent.click(screen.getByRole("button", { name: "Edit availability" }))
    fireEvent.click(screen.getByRole("button", { name: "Clear availability" }))
    fireEvent.click(
      screen.getByRole("button", { name: "Save cleared availability" })
    )
    await waitFor(() =>
      expect(saveInterviewAvailability).toHaveBeenCalledWith("window-1", [])
    )
  })

  it("keeps archived availability read-only and explains unmatched applicants", async () => {
    vi.mocked(getInterviewPlan).mockResolvedValue({
      ...plan,
      window: { ...plan.window, status: "closed" },
    })
    renderWithProviders(<InterviewPlanner windowId="window-1" />)
    expect(
      await screen.findByText("No shared block with two interviewers.")
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Edit availability" })
    ).toBeNull()
    expect(
      screen.getByText(/Draft suggestions, not bookings/)
    ).toBeInTheDocument()
  })

  it("shows a helpful error and allows retry", async () => {
    vi.mocked(getInterviewPlan).mockRejectedValueOnce(
      new Error("Service unavailable")
    )
    renderWithProviders(<InterviewPlanner windowId="window-1" />)
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Service unavailable"
    )
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    await screen.findByRole("heading", { name: "Recommended interviews" })
  })
})
