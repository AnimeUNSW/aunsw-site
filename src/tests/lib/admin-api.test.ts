import { afterEach, describe, expect, it, vi } from "vitest"

import { uploadEventAttendance } from "@/lib/admin-api"

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
