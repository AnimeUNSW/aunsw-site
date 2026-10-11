import { afterEach, describe, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { MemberSearch } from "@/components/admin/member-search"
import * as adminApi from "@/lib/admin-api"
import { renderWithProviders } from "@/tests/render-with-providers"

const member: adminApi.AdminMember = {
  discord_id: "123",
  username: "testmember",
  display_name: "Test Member",
  avatar_url: null,
  in_server: true,
  profile: {
    first_name: "Test",
    last_name: "Member",
    zid: "z1234567",
    email: "test@example.com",
    phone_number: null,
    membership_type: "unsw",
  },
  stats: {
    exp: 1500,
    term_exp: 500,
    rank: 1,
    message_count: 42,
    events_attended: 3,
    quote: null,
    mal_profile: null,
    anilist_profile: null,
  },
}
const results: adminApi.AdminMemberSearch = {
  query: "testmember",
  page: 1,
  page_size: 10,
  total_entries: 1,
  total_pages: 1,
  members: [member],
}

describe("member search", () => {
  afterEach(() => vi.restoreAllMocks())

  it("does not fetch or show private data before a search", () => {
    const lookup = vi.spyOn(adminApi, "searchAdminMembers")
    renderWithProviders(<MemberSearch onAccessDenied={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled()
    expect(lookup).not.toHaveBeenCalled()
    expect(screen.queryByText("test@example.com")).not.toBeInTheDocument()
  })

  it("searches with Enter and opens a read-only profile", async () => {
    const user = userEvent.setup()
    const lookup = vi
      .spyOn(adminApi, "searchAdminMembers")
      .mockResolvedValue(results)
    renderWithProviders(<MemberSearch onAccessDenied={vi.fn()} />)
    await user.type(
      screen.getByLabelText("Discord username or zID"),
      "@testmember{Enter}"
    )
    expect(
      await screen.findByText("@testmember · z1234567")
    ).toBeInTheDocument()
    expect(lookup).toHaveBeenCalledWith(
      "@testmember",
      1,
      expect.any(AbortSignal)
    )
    await user.click(screen.getByText("View profile"))
    expect(screen.getByText("test@example.com")).toBeVisible()
    expect(screen.getByText("Events attended")).toBeVisible()
    expect(screen.getByText("1,500")).toBeVisible()
    expect(
      screen.queryByRole("button", { name: /save/i })
    ).not.toBeInTheDocument()
  })

  it("searches by zID and shows no matches clearly", async () => {
    const user = userEvent.setup()
    vi.spyOn(adminApi, "searchAdminMembers").mockResolvedValue({
      ...results,
      query: "z7654321",
      total_entries: 0,
      members: [],
    })
    renderWithProviders(<MemberSearch onAccessDenied={vi.fn()} />)
    await user.type(
      screen.getByLabelText("Discord username or zID"),
      "z7654321"
    )
    await user.click(screen.getByRole("button", { name: "Search" }))
    expect(
      await screen.findByText("No members found for “z7654321”.")
    ).toBeInTheDocument()
  })

  it("uses the searched query when paging through results", async () => {
    const user = userEvent.setup()
    const lookup = vi
      .spyOn(adminApi, "searchAdminMembers")
      .mockResolvedValueOnce({ ...results, total_entries: 12, total_pages: 2 })
      .mockResolvedValueOnce({
        ...results,
        page: 2,
        total_entries: 12,
        total_pages: 2,
      })
    renderWithProviders(<MemberSearch onAccessDenied={vi.fn()} />)
    await user.type(
      screen.getByLabelText("Discord username or zID"),
      "testmember{Enter}"
    )
    await user.click(await screen.findByRole("button", { name: "Next" }))
    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument()
    expect(lookup).toHaveBeenLastCalledWith(
      "testmember",
      2,
      expect.any(AbortSignal)
    )
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
  })

  it("shows errors and allows retrying", async () => {
    const user = userEvent.setup()
    vi.spyOn(adminApi, "searchAdminMembers")
      .mockRejectedValueOnce(new Error("Could not connect. Please try again."))
      .mockResolvedValueOnce(results)
    renderWithProviders(<MemberSearch onAccessDenied={vi.fn()} />)
    await user.type(
      screen.getByLabelText("Discord username or zID"),
      "testmember{Enter}"
    )
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not connect."
    )
    await user.click(screen.getByRole("button", { name: "Search" }))
    expect(
      await screen.findByText("@testmember · z1234567")
    ).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("removes previously loaded profiles when access is revoked", async () => {
    const user = userEvent.setup()
    const denied = vi.fn()
    vi.spyOn(adminApi, "searchAdminMembers")
      .mockResolvedValueOnce(results)
      .mockRejectedValueOnce(new adminApi.AdminAccessError("Role required"))
    renderWithProviders(<MemberSearch onAccessDenied={denied} />)
    await user.type(
      screen.getByLabelText("Discord username or zID"),
      "testmember{Enter}"
    )
    expect(
      await screen.findByText("@testmember · z1234567")
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Search" }))
    expect(denied).toHaveBeenCalledWith("Role required")
    expect(screen.queryByText("test@example.com")).not.toBeInTheDocument()
  })
})
