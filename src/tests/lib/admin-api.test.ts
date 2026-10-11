import { afterEach, describe, expect, it, vi } from "vitest"

import {
  AdminAccessError,
  searchAdminMembers,
  uploadEventAttendance,
} from "@/lib/admin-api"

describe("admin attendance API", () => {
  afterEach(() => vi.restoreAllMocks())

  it("uploads the CSV bytes to the selected website event", async () => {
    const response = {
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
    }
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(response), { status: 200 })
      )
    const file = new File(["zID\nz1234567\n"], "attendance.csv", {
      type: "text/csv",
    })

    await expect(uploadEventAttendance("evt-kickoff", file)).resolves.toEqual(
      response
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/v1/admin/events/evt-kickoff/attendance"),
      expect.objectContaining({
        method: "POST",
        body: file,
        credentials: "include",
        headers: expect.objectContaining({ "Content-Type": "text/csv" }),
      })
    )
  })
})

describe("admin member search API", () => {
  afterEach(() => vi.restoreAllMocks())

  it("encodes searches, sends the session cookie, and supports cancellation", async () => {
    const payload = { query: "user&name", members: [], total_entries: 0 }
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(payload)))
    const controller = new AbortController()
    await expect(
      searchAdminMembers(" user&name ", 2, controller.signal)
    ).resolves.toEqual(payload)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.animeunsw.net/v1/admin/members?q=user%26name&page=2",
      expect.objectContaining({
        credentials: "include",
        signal: controller.signal,
      })
    )
  })

  it.each([401, 403])("handles denied access (%s)", async (status) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status })
    )
    await expect(searchAdminMembers("test")).rejects.toBeInstanceOf(
      AdminAccessError
    )
  })

  it("shows a useful network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch")
    )
    await expect(searchAdminMembers("test")).rejects.toThrow(
      "Could not connect to the admin service. Please try again."
    )
  })

  it("keeps aborted requests silent", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new DOMException("Aborted", "AbortError")
    )
    await expect(searchAdminMembers("test")).rejects.toHaveProperty(
      "name",
      "AbortError"
    )
  })

  it("displays validation errors instead of a generic failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: [{ msg: "Enter a valid zID" }] }), {
        status: 422,
      })
    )
    await expect(searchAdminMembers("test")).rejects.toThrow(
      "Enter a valid zID"
    )
  })
})
