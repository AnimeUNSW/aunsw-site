import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AppRoutes } from "@/app/app-routes"
import { getAccount, type Account } from "@/lib/account-api"
import { renderWithProviders } from "@/tests/render-with-providers"

vi.mock("@/lib/account-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/account-api")>()),
  getAccount: vi.fn(),
}))
vi.mock("@/components/applications/interview-planner", () => ({
  InterviewPlanner: ({ windowId }: { windowId: string }) => (
    <p>Planner for {windowId}</p>
  ),
}))

describe("interviews route authorization", () => {
  afterEach(() => vi.clearAllMocks())
  it("denies non-admin direct URL access", async () => {
    vi.mocked(getAccount).mockResolvedValue({ is_admin: false } as Account)
    renderWithProviders(<AppRoutes />, {
      route: "/admin/applications/window-1/interviews",
    })
    expect(
      await screen.findByRole("heading", { name: "Access denied" })
    ).toBeInTheDocument()
    expect(screen.queryByText("Planner for window-1")).toBeNull()
  })
  it("admits authorized execs or directors through the new route", async () => {
    vi.mocked(getAccount).mockResolvedValue({ is_admin: true } as Account)
    renderWithProviders(<AppRoutes />, {
      route: "/admin/applications/window-1/interviews",
    })
    expect(await screen.findByText("Planner for window-1")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Back to applications" })
    ).toHaveAttribute("href", "/admin/applications/responses?window=window-1")
  })
})
