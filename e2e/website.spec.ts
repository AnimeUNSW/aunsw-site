import { test, expect } from "./fixtures"

for (const [path, title] of [
  ["/", "Anime nights, socials, and community on campus"],
  ["/events", "Events"],
  ["/sponsors", "Sponsors"],
  ["/team", "Meet the Team"],
  ["/info", "Info"],
] as const) {
  test(`public route ${path} loads, refreshes, and serves its images`, async ({
    page,
    api,
  }) => {
    api.account = null
    await page.goto(path)
    await expect(
      page.getByRole("heading", { name: title, exact: true })
    ).toBeVisible()
    await page.reload()
    await expect(
      page.getByRole("heading", { name: title, exact: true })
    ).toBeVisible()
    // Scroll lazy-loaded images into view before checking the real built URLs.
    for (const image of await page.locator("img:visible").all()) {
      await image.scrollIntoViewIfNeeded()
      await expect
        .poll(() =>
          image.evaluate(
            (node: HTMLImageElement) => node.complete && node.naturalWidth > 0
          )
        )
        .toBe(true)
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  })
}

test("event filters and past registration rules work", async ({
  page,
  api,
}) => {
  api.account = null
  await page.goto("/events")
  await page.getByRole("tab", { name: "Weekly", exact: true }).click()
  await expect(
    page.getByRole("tab", { name: "Weekly", exact: true })
  ).toHaveAttribute("aria-selected", "true")
  const cards = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByRole("heading", { level: 3 }) })
  await expect(cards.first()).toBeVisible()
  for (const card of await cards.all())
    await expect(card.getByText("Weekly", { exact: true })).toBeVisible()
  await page.getByRole("tab", { name: "Past Events", exact: true }).click()
  await expect(
    page.getByRole("tab", { name: "Past Events", exact: true })
  ).toHaveAttribute("aria-selected", "true")
  await expect(
    page.getByRole("link", { name: "Register", exact: true })
  ).toHaveCount(0)
})

test("navigation, keyboard theme toggle, and persistence work", async ({
  page,
  api,
  isMobile,
}) => {
  api.account = null
  await page.goto("/info")
  await expect(page.locator("html")).toHaveClass(/light/)
  await page.keyboard.press("d")
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/dark/)
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation menu" }).click()
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Events", exact: true })
      .click()
  } else {
    await page
      .getByRole("navigation", { name: "Main", exact: true })
      .getByRole("link", { name: "Events", exact: true })
      .click()
  }
  await expect(page).toHaveURL(/\/events$/)
  await expect(
    page.getByRole("heading", { name: "Events", exact: true })
  ).toBeVisible()
})

test("Pages fallback is included and unknown routes recover", async ({
  page,
  api,
  request,
}) => {
  api.account = null
  const [index, fallback] = await Promise.all([
    request.get("/"),
    request.get("/404.html"),
  ])
  expect(fallback.ok()).toBe(true)
  expect(await fallback.text()).toBe(await index.text())
  await page.goto("/test-unknown-route")
  await expect(page.getByText("Page not found", { exact: true })).toBeVisible()
  await page.getByRole("link", { name: "Back to home", exact: true }).click()
  await expect(page).toHaveURL("/")
})

test("Discord sign-in links preserve the return route", async ({
  page,
  api,
}) => {
  api.account = null
  for (const path of ["/account", "/apply"]) {
    await page.goto(path)
    const link = page.getByRole("link", { name: "Sign in with Discord" })
    await expect(link).toBeVisible()
    const url = new URL((await link.getAttribute("href"))!)
    expect(url.pathname).toBe("/auth/discord/start")
    expect(url.searchParams.get("return_to")).toBe(
      `http://127.0.0.1:4173${path}`
    )
  }
})

for (const role of ["guest", "member"] as const) {
  test(`${role} cannot open admin tools or fetch their private content`, async ({
    page,
    api,
  }) => {
    if (role === "guest") api.account = null
    else api.account!.is_admin = false
    for (const path of [
      "/admin",
      "/admin/events",
      "/admin/team",
      "/admin/members",
      "/admin/applications",
      "/admin/applications/forms",
      "/admin/applications/responses",
      "/admin/applications/test-window/interviews",
    ]) {
      await page.goto(path)
      await expect(
        page.getByRole("heading", { name: "Access denied", exact: true })
      ).toBeVisible()
    }
    expect(
      api.requests.filter((request) => request.path.startsWith("/v1/admin/"))
    ).toEqual([])
  })
}

test("account settings save and logout clears the session", async ({
  page,
  api,
}) => {
  await page.goto("/account")
  await page.getByLabel("First name", { exact: true }).fill("Updated")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await expect(page.getByText("Your profile has been updated.")).toBeVisible()
  expect(api.account!.profile.first_name).toBe("Updated")
  await page.reload()
  await expect(page.getByLabel("First name", { exact: true })).toHaveValue(
    "Updated"
  )
  await page.getByRole("button", { name: "Log out", exact: true }).click()
  await expect(
    page.getByRole("link", { name: "Sign in with Discord" })
  ).toBeVisible()
  expect(api.account).toBeNull()
})

test("member lookup opens a read-only profile", async ({ page, api }) => {
  await page.goto("/admin/members")
  await page.getByLabel("Discord username or zID").fill("test_committee")
  await page.getByLabel("Discord username or zID").press("Enter")
  await expect(
    page.getByRole("status").filter({ hasText: "1 member found" })
  ).toBeVisible()
  await page.getByText("View profile", { exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Member details" })
  ).toBeVisible()
  expect(
    api.requests.some((request) => request.path === "/v1/admin/members")
  ).toBe(true)
  await expect(page.getByRole("button", { name: "Save profile" })).toHaveCount(
    0
  )
})

test("leaderboard requires login and supports ranking and pagination", async ({
  page,
  api,
}) => {
  const account = api.account
  api.account = null
  await page.goto("/leaderboard")
  await expect(
    page.getByRole("heading", { name: "Members only" })
  ).toBeVisible()
  api.account = account
  await page.reload()
  await expect(page.getByText(/^First page member/)).toBeVisible()
  await page.getByRole("button", { name: "Next", exact: true }).click()
  await expect(page.getByText(/^Second page member/)).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Next", exact: true })
  ).toBeDisabled()
  await page.getByRole("tab", { name: "Events attended", exact: true }).click()
  await expect(page.getByText(/^First page member/)).toBeVisible()
  await expect(
    page.getByRole("tab", { name: "Events attended", exact: true })
  ).toHaveAttribute("aria-selected", "true")
})

test("FAQ answers and team carousel controls respond to visitors", async ({
  page,
  api,
}) => {
  api.account = null
  await page.goto("/info")
  const question = page.locator('[data-slot="accordion-trigger"]').first()
  await question.click()
  await expect(question).toHaveAttribute("aria-expanded", "true")
  await question.click()
  await expect(question).toHaveAttribute("aria-expanded", "false")
  await page.goto("/team")
  const carousel = page
    .getByRole("region", { name: "Team profile carousel", exact: true })
    .first()
  const position = carousel.getByText(/^Showing/)
  const before = await position.textContent()
  await carousel.getByRole("button", { name: /next/i }).click()
  await expect(position).not.toHaveText(before!)
})
