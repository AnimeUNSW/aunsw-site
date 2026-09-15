import { afterEach, describe, expect, it, vi } from "vitest"

import { getLeaderboard } from "@/lib/account-api"

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
