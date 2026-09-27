import { afterEach, describe, expect, it, vi } from "vitest"

import {
  saveApplicationForms,
  type ApplicationFormTemplate,
} from "@/lib/applications-api"

describe("applications form API", () => {
  afterEach(() => vi.restoreAllMocks())

  it("omits fixed and UI-only fields when saving a new portfolio question", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ version: 2 }), { status: 200 })
      )
    const template: ApplicationFormTemplate = {
      version: 1,
      updated_at: "2026-09-27T00:00:00Z",
      locked: false,
      questions: [
        {
          id: "10000000-0000-0000-0000-000000000001",
          section: "general",
          fixed_key: "full_name",
          question_text: "Full name",
          answer_type: "short_text",
          required: true,
          min_length: 1,
          max_length: 160,
          allow_multiple: false,
          display_order: 0,
          options: [],
        },
        {
          id: "20000000-0000-0000-0000-000000000001",
          section: "it",
          fixed_key: null,
          question_text: "Hello",
          answer_type: "short_text",
          required: true,
          min_length: 2,
          max_length: 500,
          allow_multiple: false,
          display_order: 10,
          options: [],
        },
      ],
    }

    await expect(saveApplicationForms(template)).resolves.toEqual({
      version: 2,
    })

    const request = fetchMock.mock.calls[0][1]
    const body = JSON.parse(String(request?.body))
    expect(body).toEqual({
      version: 1,
      questions: [
        {
          id: "20000000-0000-0000-0000-000000000001",
          section: "it",
          question_text: "Hello",
          answer_type: "short_text",
          required: true,
          min_length: 2,
          max_length: 500,
          allow_multiple: false,
          display_order: 10,
          options: [],
        },
      ],
    })
    expect(body.questions[0]).not.toHaveProperty("fixed_key")
  })
})
