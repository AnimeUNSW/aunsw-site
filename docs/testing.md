# Testing

The site uses Vitest with Testing Library and jsdom for unit/integration tests,
and Playwright for browser tests of the production build. Vitest configuration
lives in `vite.config.ts`; Playwright configuration lives in `playwright.config.ts`.

## GitHub release pipeline

`.github/workflows/deploy-pages.yml` runs for pull requests to `main`, pushes to
`main`, and manual runs. It checks ESLint, TypeScript (including browser tests),
all unit/integration tests, and a production build. Browser tests then download
that exact build and run in Chromium at desktop and Pixel 7 mobile sizes.
Only successful runs on `main` can deploy. Pull requests never publish the site.

The workflow uploads unit results and a browser HTML report. Failed browser
tests retain screenshots, video, and traces for 14 days. Open the run's
`browser-test-results` artifact to diagnose failures. One CI retry helps identify
transient failures; a consistently failing test blocks publishing.

| Feature | Automated checks |
| --- | --- |
| Public pages and assets | Home, events, sponsors, team, and info direct loads/refreshes, visible images, mobile overflow, Pages fallback and unknown-route recovery |
| Navigation and theme | Desktop/mobile navigation, keyboard theme toggle, persistence after refresh |
| Events | Category filtering, past-event registration, create/edit/remove with cancellation and confirmation |
| Attendance | Collapsed by default, keyboard expansion, confirmed CSV upload, count updates, confirmed removal |
| Accounts and access | Discord login links, profile save/reload, logout, guest/member denial on every admin route without loading private content |
| Leaderboard | Members-only state, ranking tabs, pagination |
| Team | Carousel/autoplay, portfolio selection, profile creation/image upload/edit/removal |
| Membership and FAQ | Rendering and answer expansion/collapse |
| Applications | Draft autosave/reload, portfolio answers, review confirmation, submission locking, withdrawal, applicant search/status/pagination |
| Recruitment administration | Form save, publishing a question snapshot, locked forms, closing/reopening editing |
| Interviews | Own availability save/reload, settings changes, clearing times, archived read-only state |
| Member lookup and errors | Search, read-only details, revoked access, retries, GitHub-read error messages |

Browser API calls use fictional in-memory fixtures in `e2e/fixtures.ts`. External
requests must match an explicit fixture or fail the test; no production API,
Discord login, email, or GitHub content writes occur. Browser tests verify the
frontend contract and workflow, not live OAuth, database behavior, GitHub token
permissions, or the interview matching algorithm. Those require the Ibi backend
test/deployment pipeline and live smoke checks. No credentials are needed for CI.

## Commands

```bash
npm test
npm run test:watch
```

Run the browser suite locally:

```bash
npm ci
npx playwright install chromium
npm run build:pages
npm run test:e2e
```

`build:pages` creates `dist/404.html` using the same preparation step as CI.
Playwright starts Vite preview on `127.0.0.1:4173`; it tests `dist/`, not the dev
server. Rebuild after source changes. Use `npm run test:e2e:ui` for interactive
debugging, or `npx playwright show-report` to view the latest HTML report.
Run `npx playwright install --with-deps chromium` on a fresh Linux machine.

Run one file:

```bash
npx vitest run src/tests/components/event-card.test.tsx
```

Run tests whose names match a phrase:

```bash
npx vitest run -t "renders events page"
```

The repository does not currently define a coverage command or threshold.

## Test layout

```text
src/tests/
├── setup.ts                         jest-dom matchers
├── render-with-providers.tsx        theme, tooltip, and memory-router wrapper
├── components/                      component behavior
├── lib/                             pure/domain behavior
└── pages/                           route integration
```

`src/tests/` covers component/domain behavior and route integration; `e2e/`
covers the feature journeys listed above in real browsers. Vitest only collects
`src/tests/**/*.test.{ts,tsx}`, so the two runners do not collect each other's tests.

## Rendering components

Use `renderWithProviders` for components that depend on routing, tooltips, or
theme context:

```tsx
renderWithProviders(<Example />, { route: "/events" })
```

It installs:

- `ThemeProvider` with a deterministic light theme and test storage key;
- `TooltipProvider`; and
- `MemoryRouter` with the requested initial route.

Plain `render` is appropriate only when the component and its descendants do
not consume those contexts. If a theme-aware descendant is later introduced, a
plain-render test will correctly fail until its setup represents the real app.

## Query and assertion style

Prefer queries that match how a user or assistive technology finds content:

1. `getByRole` with an accessible name;
2. `getByLabelText`;
3. visible text;
4. test IDs only for non-semantic decorative/animation layers.

Use `userEvent` for normal interaction. Use `fireEvent` for low-level events
such as exact pointer coordinates when `userEvent` does not express the
behavior.

Test outcomes rather than internal state or class implementation. Class
assertions are appropriate when the class itself is the behavior under test,
such as reduced-motion hooks or required cursor affordance.

## Time-dependent tests

Event status, event ordering, and team autoplay depend on time. Use fake timers
and always restore them:

```tsx
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})
```

For calendar behavior:

```tsx
vi.setSystemTime(new Date("2026-03-12T12:00:00.000Z"))
```

When `userEvent` and fake timers are combined, configure or advance timers in a
way that does not leave user-event promises pending. Keep test dates explicit
and do not rely on the actual current date.

## Browser API mocks

jsdom does not fully implement every browser API. The hero tests provide a
`matchMedia` object with both modern listener methods. Follow that model when a
component depends on media queries.

Mock the smallest surface required and restore globals/spies in `afterEach`.
Do not add broad global mocks that conceal missing browser behavior in unrelated
tests.

Account- and application-route tests stub `fetch` with only the required status
and response. Restore the stub after each test so authenticated API state does
not affect other route tests.

Application-browser tests cover all-portfolio review, search/status filters,
compact pagination, a single rendered availability grid, retry and the
open-window interview link. Planner tests cover own-availability saving,
unsaved-selection preservation during settings changes, clearing availability,
portfolio-link prompts and archived read-only behavior. Direct-route tests
check both admin admission and denial; Ibi independently tests server-side
authorization, live interviewer roles and matching constraints. Browser QA
uses fictional local fixtures, never live applicants' personal details.

## What to test for a change

| Change                       | Minimum useful coverage                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| JSON schema or validator     | Valid record plus a representative rejection                                        |
| Repository sorting/filtering | Pure test with controlled time and unsorted input                                   |
| New route                    | Route renders its unique heading/content and unknown paths still work               |
| Interactive component        | Initial state, user action, resulting state, keyboard behavior                      |
| Date/past-event behavior     | Boundary around end time with fake system time                                      |
| Theme-aware component        | Render under shared providers and check both token-compatible states where relevant |
| Animation                    | Trigger, cleanup, reduced-motion path                                               |
| Accessibility fix            | Query by role/name and assert the relevant semantic attribute                       |

Content-only changes generally do not need a new test when the existing runtime
validator and rendering behavior already cover the shape. They still require
the complete build and a visual check.

## Full verification

Tests are one part of the release gate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Also inspect the affected page manually for responsive layout, focus order,
theme contrast, image loading, and external links. Unit tests do not validate
the static host's SPA fallback or all browser layout behavior.

## Failure triage

When a suite fails:

1. run the failing file alone;
2. identify whether the failure is compilation, test setup, behavior, or stale
   expectation;
3. compare the component's real provider tree with the test wrapper;
4. control current time and browser APIs explicitly;
5. update expectations only when the intended behavior truly changed; and
6. rerun the full suite to detect shared-state leakage.

Warnings about updates outside `act`, open timers, or unhandled promises are
test defects even if the process exits zero. Clean them up rather than ignoring
them.
