# Testing

The site uses Vitest with Testing Library and jsdom. Vitest configuration lives
in `vite.config.ts`; shared setup lives under `src/tests/`.

## Commands

```bash
npm test
npm run test:watch
```

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

Current coverage focuses on:

- top-level route rendering;
- event card metadata, recurring/past state, and registration;
- event repository ordering;
- FAQ interaction;
- hero artwork, pointer motion, and reduced motion; and
- team carousel navigation and autoplay.

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

Account-route tests stub `fetch` with only the required status and response.
Restore the stub after each test so account authentication does not affect other
route tests.

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
