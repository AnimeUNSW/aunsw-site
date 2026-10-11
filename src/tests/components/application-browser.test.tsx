import { fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ApplicationBrowser } from "@/components/applications/application-browser"
import {
  getApplicationWindow,
  type ApplicationWindowDetail,
} from "@/lib/applications-api"
import { renderWithProviders } from "@/tests/render-with-providers"

vi.mock("@/lib/applications-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/applications-api")>()),
  getApplicationWindow: vi.fn(),
}))

const detail: ApplicationWindowDetail = {
  window: {
    id: "window-1",
    name: "Recruitment",
    status: "open",
    application_type: "director",
    opened_at: "2026-10-11T00:00:00Z",
    application_count: 8,
  },
  questions: [
    {
      id: "availability",
      section: "general",
      fixed_key: "weekly_availability",
      question_text: "Weekly availability",
      answer_type: "weekly_availability",
      required: true,
      min_length: null,
      max_length: null,
      allow_multiple: true,
      display_order: 5,
      options: [],
    },
  ],
  applications: Array.from({ length: 8 }, (_, index) => ({
    id: `app-${index}`,
    window_id: "window-1",
    full_name: `Applicant ${index} Full`,
    preferred_name: `Applicant ${index}`,
    username: `member${index}`,
    status: index === 7 ? "withdrawn" : "submitted",
    year_of_study: "2",
    membership_number: "1234",
    portfolios: index === 1 ? ["events"] : ["it"],
    answers: { availability: ["mon-09:00"] },
    confirmation_email: null,
    email_opt_in: false,
    submitted_at: "2026-10-11T00:00:00Z",
    withdrawn_at: index === 7 ? "2026-10-11T01:00:00Z" : null,
  })),
}

function renderBrowser(windows = [detail.window]) {
  return renderWithProviders(
    <ApplicationBrowser
      windows={windows}
      onChanged={vi.fn().mockResolvedValue(undefined)}
    />
  )
}

describe("application browser", () => {
  beforeEach(() => vi.mocked(getApplicationWindow).mockResolvedValue(detail))
  afterEach(() => vi.clearAllMocks())

  it("shows all portfolios and one applicant availability grid at a time", async () => {
    renderBrowser()
    expect(
      await screen.findByRole("button", { name: "All applicants (7)" })
    ).toBeInTheDocument()
    expect(screen.getAllByRole("grid")).toHaveLength(1)
    expect(
      screen.getByRole("link", { name: "Arrange interviews" })
    ).toHaveAttribute("href", "/admin/applications/window-1/interviews")
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(
      screen.getByRole("heading", { name: "Applicant 1" })
    ).toBeInTheDocument()
    expect(screen.getAllByRole("grid")).toHaveLength(1)
  })

  it("opens the linked applicant on the correct list page", async () => {
    renderWithProviders(
      <ApplicationBrowser windows={[detail.window]} onChanged={vi.fn()} />,
      { route: "/admin/applications/responses?window=window-1&applicant=app-6" }
    )
    expect(
      await screen.findByRole("heading", { name: "Applicant 6" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Previous applicant page" })
    ).toBeEnabled()
    expect(
      screen.getByRole("button", { name: "Next applicant page" })
    ).toBeDisabled()
  })

  it("filters portfolios, searches applicants and shows withdrawn accurately", async () => {
    renderBrowser()
    await screen.findByRole("button", { name: "IT (6)" })
    fireEvent.click(screen.getByRole("button", { name: "Events (1)" }))
    expect(
      screen.getByRole("heading", { name: "Applicant 1" })
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "All applicants (7)" }))
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search applicants" }),
      { target: { value: "member3" } }
    )
    expect(
      screen.getByRole("heading", { name: "Applicant 3" })
    ).toBeInTheDocument()
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search applicants" }),
      { target: { value: "" } }
    )
    fireEvent.change(
      screen.getByRole("combobox", { name: "Application status" }),
      { target: { value: "withdrawn" } }
    )
    expect(
      screen.getByRole("heading", { name: "Applicant 7" })
    ).toBeInTheDocument()
    expect(screen.queryByText("Deleted")).toBeNull()
  })

  it("paginates the compact list without rendering every response", async () => {
    renderBrowser()
    await screen.findByRole("button", { name: "Next applicant page" })
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Next applicant page" }))
    expect(
      screen.getByRole("heading", { name: "Applicant 6" })
    ).toBeInTheDocument()
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument()
  })

  it("hides arranging interviews on archived windows", async () => {
    vi.mocked(getApplicationWindow).mockResolvedValue({
      ...detail,
      window: { ...detail.window, status: "closed" },
    })
    renderBrowser([{ ...detail.window, status: "closed" }])
    await screen.findByRole("button", { name: "All applicants (7)" })
    expect(
      screen.queryByRole("link", { name: "Arrange interviews" })
    ).toBeNull()
    expect(
      screen.getByRole("button", { name: "Delete archive" })
    ).toBeInTheDocument()
  })

  it("offers retry after network failure without retaining old responses", async () => {
    vi.mocked(getApplicationWindow).mockRejectedValueOnce(
      new Error("Could not connect")
    )
    renderBrowser()
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not connect"
    )
    expect(screen.queryByRole("grid")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Applicant 0" })
      ).toBeInTheDocument()
    )
  })
})
