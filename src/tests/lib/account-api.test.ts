import { afterEach, describe, expect, it, vi } from "vitest"

import {
  getLeaderboard,
  requestAccountEmailChange,
  updateAccountProfile,
} from "@/lib/account-api"

describe("leaderboard API", () => {
  afterEach(() => vi.restoreAllMocks())

  it("requests only the selected leaderboard page", async () => {
    const response = {
      sort: "xp",
      viewer_discord_id: "123",
      page: 2,
      page_size: 25,
      total_entries: 60,
      total_pages: 3,
      entries: [],
    }
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(response), { status: 200 })
      )

    await expect(getLeaderboard("xp", 2, 25)).resolves.toEqual(response)
    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]))
    expect(requestedUrl.searchParams.get("sort")).toBe("xp")
    expect(requestedUrl.searchParams.get("page")).toBe("2")
    expect(requestedUrl.searchParams.get("page_size")).toBe("25")
  })
})

describe("account settings API", () => {
  afterEach(() => vi.restoreAllMocks())

  it("saves profile fields with the authenticated session", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ status: "saved" }), { status: 200 })
      )
    await updateAccountProfile({
      first_name: "Member",
      last_name: "",
      phone_number: null,
      quote: "Hi",
      mal_profile: "animefan",
      anilist_profile: null,
    })
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "PATCH",
      credentials: "include",
    })
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      quote: "Hi",
      mal_profile: "animefan",
    })
  })

  it("requests a new verification email instead of directly changing a zID", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ sent_to: "z1234567@ad.unsw.edu.au" }), {
        status: 202,
      })
    )
    await requestAccountEmailChange({ kind: "zid", zid: "z1234567" })
    expect(String(fetchMock.mock.calls[0][0])).toContain("/v1/me/email-changes")
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      credentials: "include",
    })
  })
})
