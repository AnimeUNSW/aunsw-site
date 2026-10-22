import { test, expect } from "./fixtures"

test("recruitment form changes are saved and publishing locks the snapshot until closing", async ({
  page,
  api,
}) => {
  api.window.status = "closed"
  await page.goto("/admin/applications/forms")
  await page.getByRole("button", { name: "Add question", exact: true }).click()
  await page
    .getByLabel("Question", { exact: true })
    .fill("What would you bring to the team?")
  await page.getByRole("button", { name: "Save form", exact: true }).click()
  await expect(
    page.getByText("Application form saved for the next recruitment window.")
  ).toBeVisible()
  expect(api.forms.questions[0].question_text).toBe(
    "What would you bring to the team?"
  )
  await page
    .getByRole("button", { name: "Open Applications", exact: true })
    .click()
  await page.getByLabel("Application-window name").fill("New test recruitment")
  await page
    .getByRole("button", { name: "Publish and open", exact: true })
    .click()
  await expect(
    page.getByRole("heading", {
      name: "Published forms are locked",
      exact: true,
    })
  ).toBeVisible()
  expect(api.window.questions![0].question_text).toBe(
    "What would you bring to the team?"
  )
  await page
    .getByRole("button", { name: "Close Applications", exact: true })
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close Applications", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "Add question", exact: true })
  ).toBeVisible()
  expect(api.window.status).toBe("closed")
})

test("application drafts survive reload, submit locks answers, and withdrawal reopens a draft", async ({
  page,
  api,
}) => {
  await page.goto("/apply")
  await page.getByLabel(/^Full name/).fill("Fictional Applicant")
  await page.getByLabel(/^Preferred name/).fill("Fictional")
  await page.getByLabel(/^Year of study/).selectOption("3")
  await page.getByLabel(/^AnimeUNSW membership number/).fill("0000")
  await page.getByLabel("IT", { exact: true }).check()
  await expect.poll(() => api.draft?.full_name).toBe("Fictional Applicant")
  await page.reload()
  await expect(page.getByLabel(/^Full name/)).toHaveValue("Fictional Applicant")
  await page.getByRole("button", { name: "Continue", exact: true }).click()
  await page
    .getByLabel("Why IT?")
    .fill("I enjoy building useful community tools.")
  await page.getByRole("button", { name: "Continue", exact: true }).click()
  const submit = page.getByRole("button", {
    name: "Submit application",
    exact: true,
  })
  await expect(submit).toBeDisabled()
  await page.getByLabel(/I have reviewed my answers/).check()
  await submit.click()
  await expect(
    page.getByRole("heading", { name: "Application submitted", exact: true })
  ).toBeVisible()
  expect(api.history[0].answers.motivation).toBe(
    "I enjoy building useful community tools."
  )
  await expect(page.getByLabel(/^Full name/)).toHaveCount(0)
  page.once("dialog", (dialog) => dialog.accept())
  await page
    .getByRole("button", { name: "Withdraw application", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "Director Application", exact: true })
  ).toBeVisible()
  expect(api.history[0].status).toBe("withdrawn")
})

test("application review filters applicants and opens interview planning", async ({
  page,
  api,
}) => {
  api.history = [
    {
      id: "test-application",
      window_id: api.window.id,
      full_name: "Fictional Applicant",
      preferred_name: "Fictional",
      year_of_study: "3",
      membership_number: "0000",
      portfolios: ["it"],
      answers: { motivation: "I enjoy coding." },
      confirmation_email: null,
      email_opt_in: false,
      status: "submitted",
      submitted_at: "2026-10-22T00:00:00Z",
      withdrawn_at: null,
    },
  ]
  await page.goto("/admin/applications/responses")
  await expect(page.getByRole("button", { name: /Fictional/ })).toBeVisible()
  await page.getByLabel("Search applicants").fill("no match")
  await expect(page.getByText(/No matching applications/)).toBeVisible()
  await page.getByLabel("Search applicants").fill("Fictional")
  await page.getByRole("button", { name: /Fictional/ }).click()
  await expect(
    page.getByText("Fictional Applicant", { exact: true }).first()
  ).toBeVisible()
  await page.getByRole("link", { name: "Arrange interviews" }).click()
  await expect(
    page.getByRole("heading", { name: "Arrange interviews", exact: true })
  ).toBeVisible()
  await page
    .getByRole("button", { name: "Edit availability", exact: true })
    .click()
  await page.getByRole("gridcell").first().click()
  await page
    .getByRole("button", { name: "Save my availability", exact: true })
    .click()
  await expect(
    page.getByText(/Your interview availability was saved/)
  ).toBeVisible()
  expect(api.plan.interviewers[0].slots).toHaveLength(1)
  await page.reload()
  await expect(
    page.getByText("1 half-hour slots saved for this window.", { exact: false })
  ).toBeVisible()
})
