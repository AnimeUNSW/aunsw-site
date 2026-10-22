import { test, expect } from "./fixtures"

test("events can be created, edited, and removed after confirmation", async ({
  page,
  api,
}) => {
  await page.goto("/admin/events")
  await page.getByRole("button", { name: "Add event", exact: true }).click()
  await page.getByLabel("Title", { exact: true }).fill("New test event")
  await page.getByLabel(/^Page anchor/).fill("new-test-event")
  await page
    .getByLabel("Description", { exact: true })
    .fill("A fictional test event.")
  await page.getByLabel("weekly", { exact: true }).check()
  await page.getByLabel("Starts", { exact: true }).fill("2026-10-30T18:00")
  await page.getByLabel("Ends", { exact: true }).fill("2026-10-30T20:00")
  await page.getByLabel("Location", { exact: true }).fill("Test Theatre")
  await page.getByRole("button", { name: "Save event", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "New test event", exact: true })
  ).toBeVisible()
  const card = page.locator('[data-slot="card"]').filter({
    has: page.getByRole("heading", { name: "New test event", exact: true }),
  })
  await card.getByRole("button", { name: "Edit", exact: true }).click()
  await page.getByLabel("Title", { exact: true }).fill("Updated test event")
  await page.getByRole("button", { name: "Save event", exact: true }).click()
  const updated = page.locator('[data-slot="card"]').filter({
    has: page.getByRole("heading", {
      name: "Updated test event",
      exact: true,
    }),
  })
  await updated.getByRole("button", { name: "Remove", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel", exact: true })
    .click()
  expect(api.events).toHaveLength(2)
  await updated.getByRole("button", { name: "Remove", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "Updated test event", exact: true })
  ).toHaveCount(0)
  expect(api.events).toHaveLength(1)
})

test("attendance is collapsed, keyboard expandable, and uploads/removals require confirmation", async ({
  page,
  api,
}) => {
  await page.goto("/admin/events")
  const disclosure = page.locator("details").filter({ hasText: "existing.csv" })
  await expect(disclosure).not.toHaveAttribute("open")
  await expect(page.getByText("existing.csv", { exact: true })).toBeHidden()
  await disclosure.locator("summary").focus()
  await page.keyboard.press("Enter")
  await expect(page.getByText("existing.csv", { exact: true })).toBeVisible()
  await page.locator('input[type="file"]').setInputFiles({
    name: "test-attendance.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("zID\nz1234567\n"),
  })
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByText(/Test Movie Night/)).toBeVisible()
  expect(api.requests.filter((request) => request.method === "POST")).toEqual(
    []
  )
  await dialog.getByRole("button", { name: "Upload form", exact: true }).click()
  await expect(page.getByText("1 new attendance record added")).toBeVisible()
  await expect(
    page.getByText("test-attendance.csv", { exact: true })
  ).toBeVisible()
  expect(api.requests.find((request) => request.method === "POST")?.body).toBe(
    "zID\nz1234567\n"
  )
  await page
    .getByText("test-attendance.csv", { exact: true })
    .locator("..")
    .locator("..")
    .getByRole("button", { name: "Remove form" })
    .click()
  await dialog.getByRole("button", { name: "Remove", exact: true }).click()
  await expect(
    page.getByText("test-attendance.csv", { exact: true })
  ).toHaveCount(0)
  expect(api.events[0].attendanceCount).toBe(1)
  await page.reload()
  await expect(page.locator("details")).not.toHaveAttribute("open")
})

test("team profiles can be created, edited, and removed", async ({
  page,
  api,
}) => {
  await page.goto("/admin/team")
  await page.getByRole("button", { name: "Add committee member" }).click()
  await page.getByLabel("Name", { exact: true }).fill("Fictional Member")
  await page.getByLabel("Role", { exact: true }).fill("Test Director")
  await page.getByLabel("Portfolio", { exact: true }).fill("IT")
  await page
    .getByLabel("Image description", { exact: true })
    .fill("Fictional portrait")
  await page.getByLabel("Degree", { exact: true }).fill("Test degree")
  await page.locator('input[type="file"]').setInputFiles({
    name: "portrait.png",
    mimeType: "image/png",
    buffer: Buffer.from("test-image"),
  })
  await page.getByRole("button", { name: "Save profile" }).click()
  await expect(page.getByText("Team profile saved.")).toBeVisible()
  await expect(
    page.getByText("Fictional Member", { exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "Edit", exact: true }).click()
  await page.getByLabel("Role", { exact: true }).fill("Test Executive")
  await page.getByRole("button", { name: "Save profile" }).click()
  await expect(page.getByText(/Test Executive · IT/)).toBeVisible()
  expect(api.team[0].role).toBe("Test Executive")
  await page.getByRole("button", { name: "Remove", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove profile", exact: true })
    .click()
  await expect(page.getByText("Fictional Member", { exact: true })).toHaveCount(
    0
  )
  expect(api.team).toHaveLength(0)
})

for (const [path, apiPath] of [
  ["/admin/events", "/v1/admin/events"],
  ["/admin/team", "/v1/admin/team"],
] as const) {
  test(`${path} reports a GitHub read failure`, async ({ page, api }) => {
    api.failures[apiPath] = {
      status: 502,
      detail: "Could not read content from GitHub",
    }
    await page.goto(path)
    await expect(page.getByRole("alert")).toContainText(
      "Could not read content from GitHub"
    )
  })
}
