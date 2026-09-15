import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AccountDashboard } from "@/components/account/account-dashboard"
import { renderWithProviders } from "@/tests/render-with-providers"
import type { Account } from "@/lib/account-api"

const account: Account = {
  attendance_history: [],
  avatar_url: null,
  discord_id: "123",
  display_name: "Test Member",
  is_admin: false,
  is_executive: false,
  profile: {
    first_name: "",
    last_name: "",
    zid: null,
    email: null,
    phone_number: null,
  },
  username: "member",
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

describe("AccountDashboard", () => {
  it("does not show the admin button to a regular member", () => {
    renderWithProviders(
      <AccountDashboard
        account={account}
        isLoggingOut={false}
        onLogout={vi.fn()}
        onSaved={vi.fn()}
      />
    )
    expect(
      screen.queryByRole("link", { name: "Admin dashboard" })
    ).not.toBeInTheDocument()
  })

  it("shows the admin button to an Executive", () => {
    renderWithProviders(
      <AccountDashboard
        account={{ ...account, is_admin: true, is_executive: true }}
        isLoggingOut={false}
        onLogout={vi.fn()}
        onSaved={vi.fn()}
      />
    )
    expect(
      screen.getByRole("link", { name: "Admin dashboard" })
    ).toHaveAttribute("href", "/admin")
  })

  it("shows the admin button to a Director without an Executive role", () => {
    renderWithProviders(
      <AccountDashboard
        account={{ ...account, is_admin: true }}
        isLoggingOut={false}
        onLogout={vi.fn()}
        onSaved={vi.fn()}
      />
    )
    expect(
      screen.getByRole("link", { name: "Admin dashboard" })
    ).toHaveAttribute("href", "/admin")
  })
})
