import { afterEach, describe, expect, it, vi } from "vitest"
import {
  getInterviewPlan,
  saveInterviewAvailability,
  ApplicationAccessError,
} from "@/lib/applications-api"
import { getTeamDiscordMember } from "@/lib/admin-api"

describe("interview and team-link API clients", () => {
  afterEach(() => vi.restoreAllMocks())
  it("reads the plan with credentials and explicit duration/panel settings", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }))
    await getInterviewPlan("window-1", 60, 1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/windows/window-1/interviews?duration_minutes=60&panel_size=1"
      ),
      expect.objectContaining({ credentials: "include" })
    )
  })
  it("sends only availability slots, never another user's identity", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response('{"slots":[]}', { status: 200 }))
    await saveInterviewAvailability("window-1", [])
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "PUT",
      credentials: "include",
      body: '{"slots":[]}',
    })
  })
  it("uses a credentialed exact Discord ID lookup for team links", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }))
    await getTeamDiscordMember("419431549797269504")
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/v1/admin/team/discord-member/419431549797269504"
      ),
      expect.objectContaining({ credentials: "include" })
    )
  })
  it("describes connectivity errors and enforces admin access errors", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
    await expect(getInterviewPlan("window", 30, 2)).rejects.toThrow(
      "Could not connect to the applications service"
    )
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }))
    await expect(getInterviewPlan("window", 30, 2)).rejects.toBeInstanceOf(
      ApplicationAccessError
    )
    fetchMock.mockResolvedValueOnce(
      new Response("private server traceback", { status: 500 })
    )
    await expect(getInterviewPlan("window", 30, 2)).rejects.toThrow(
      "temporarily unavailable"
    )
  })
})
