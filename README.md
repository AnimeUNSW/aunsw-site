# AnimeUNSW website

The public website for AnimeUNSW, the anime and manga society at UNSW.
It presents club information, events, sponsor benefits, committee profiles,
membership instructions, contact links, and a Discord-linked member dashboard.

The application is a static React single-page application (SPA). Most club
content lives in JSON files, so routine updates do not require changing React
components. The member account route calls the separately deployed AnimeUNSW
API; secrets and authentication remain outside this static repository.

## Documentation index

Start with the row that best matches your task.

| Document                                           | What it covers                                                                                                                             | Read this when…                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| **[README.md](README.md)**                         | Project overview, quick start, commands, routes, repository map, and common workflows                                                      | You are new to the repository or need the shortest path to a task               |
| **[docs/architecture.md](docs/architecture.md)**   | Runtime flow, component boundaries, routing, content repository, state, styling, accessibility, and extension points                       | You need to understand how the application works or where a code change belongs |
| **[docs/content-guide.md](docs/content-guide.md)** | Exact JSON fields and allowed values for events, sponsors, FAQs, site content, and team profiles; image and date rules; editing checklists | You are updating club content or generating content changes                     |
| **[docs/development.md](docs/development.md)**     | Local setup, scripts, coding conventions, adding routes/components, formatting, and debugging                                              | You are implementing or reviewing code                                          |
| **[docs/testing.md](docs/testing.md)**             | Test structure, provider setup, fake timers, quality gates, and test-writing patterns                                                      | You are changing behavior, adding tests, or diagnosing a failed check           |
| **[docs/deployment.md](docs/deployment.md)**       | Production build output, static-host requirements, SPA fallbacks, asset paths, and release verification                                    | You are configuring hosting or publishing a release                             |
| **[AGENTS.md](AGENTS.md)**                         | Concise repository instructions and guardrails for AI coding agents                                                                        | An AI agent will inspect or modify this repository                              |

Documentation is part of the product. When a change makes any statement above
incorrect, update the relevant document in the same change.

## Quick start

### Prerequisites

- Node.js 20.19+ or 22.12+ (the supported release lines for the installed Vite
  major version)
- npm, using the committed `package-lock.json`

```bash
git clone <repository-url>
cd aunsw-site
npm ci
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`. Changes under
`src/` refresh in the browser automatically.

Before submitting a change, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

These commands are intended to exit successfully. If they do not, determine
whether the failure predates your change and report that explicitly; do not
silently treat a failing baseline as a successful verification.

## Project at a glance

### Technology

- React 19 and TypeScript
- Vite 7 for development and production builds
- React Router for client-side routes
- Tailwind CSS 4 for utility styling
- shadcn/ui and Radix primitives for reusable UI
- Vitest, Testing Library, and jsdom for tests
- ESLint and Prettier for static checks and formatting

The `@/` alias resolves to `src/` in both TypeScript and Vite.

### Routes

| URL                | Page module                    | Primary content                                                       |
| ------------------ | ------------------------------ | --------------------------------------------------------------------- |
| `/`                | `src/pages/home-page.tsx`      | Hero, club statistics, featured events, sponsor preview, social links |
| `/events`          | `src/pages/events-page.tsx`    | Filterable event listing                                              |
| `/sponsors`        | `src/pages/sponsors-page.tsx`  | Sponsor benefits and terms                                            |
| `/team`            | `src/pages/team-page.tsx`      | Committee and subcommittee carousels                                  |
| `/info`            | `src/pages/info-page.tsx`      | Membership, FAQ, Discord, and contacts                                |
| `/account`         | `src/pages/account-page.tsx`   | Discord login and personal server statistics                          |
| Any unmatched path | `src/pages/not-found-page.tsx` | In-app 404 page                                                       |

Routes are declared in `src/app/app-routes.tsx`. Navigation labels are declared
separately in `src/components/navigation/nav-items.ts`; add or remove entries in
both places when changing top-level navigation.

### Repository map

```text
.
├── public/                 Files copied to the production root unchanged
│   ├── sponsors/           Sponsor logos referenced by /sponsors/... URLs
│   └── team/portraits/     Team portraits referenced by /team/... URLs
├── src/
│   ├── app/                Route declaration
│   ├── assets/             Source-controlled assets imported by TS/TSX
│   ├── components/
│   │   ├── events/         Event filtering and cards
│   │   ├── home/           Home-page sections and hero
│   │   ├── info/           Membership, FAQ, Discord, and contacts
│   │   ├── layout/         Header, footer, and application shell
│   │   ├── navigation/     Desktop/mobile navigation and theme control
│   │   ├── shared/         Cross-feature presentation components
│   │   ├── sponsors/       Sponsor grid and terms
│   │   ├── team/           Team profile browser and cards
│   │   └── ui/             shadcn/Radix primitives
│   ├── data/               Editable JSON content
│   ├── hooks/              React adapters around the content repository
│   ├── lib/                Validation, sorting, formatting, and utilities
│   ├── pages/              Route-level page composition
│   ├── styles/             Shared layout classes
│   ├── tests/              Tests and test-provider helpers
│   └── types/              Shared content contracts
├── docs/                   Maintainer documentation
├── index.html              Vite HTML entry
├── package.json            Dependencies and developer commands
├── vite.config.ts          Vite, Tailwind, alias, and Vitest configuration
└── components.json         shadcn/ui configuration
```

Generated folders such as `node_modules/` and `dist/` are not source and should
not be committed.

## Commands

| Command              | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `npm ci`             | Reproduce the dependency tree from `package-lock.json`                  |
| `npm run dev`        | Start the Vite development server                                       |
| `npm run build`      | Type-check project references, then write a production build to `dist/` |
| `npm run preview`    | Serve the existing `dist/` build locally                                |
| `npm run lint`       | Run ESLint across the repository                                        |
| `npm run typecheck`  | Run the configured standalone TypeScript check without emitting files   |
| `npm test`           | Run all Vitest tests once                                               |
| `npm run test:watch` | Run Vitest interactively as files change                                |
| `npm run format`     | Format all TypeScript and TSX files with Prettier                       |

`npm run format` does not format Markdown, JSON, or CSS because its package
script is intentionally restricted to `**/*.{ts,tsx}`.

## Common maintenance paths

### Update club content

1. Find the matching file under `src/data/`.
2. Follow the schema and asset rules in
   [docs/content-guide.md](docs/content-guide.md).
3. Run `npm run typecheck`, `npm test`, and `npm run build`.
4. Check the affected route in both light and dark themes and at mobile width.

### Change a page

Page modules compose feature components and should contain little low-level UI.
Reuse an existing component from `src/components/ui/` or the nearest feature
folder before adding a new primitive. See
[docs/architecture.md](docs/architecture.md) for ownership boundaries.

### Add a shadcn/ui component

```bash
npx shadcn@latest add <component>
```

Generated primitives belong in `src/components/ui/`. Review generated code and
imports before committing; the repository uses no semicolons, double quotes,
and the `@/` alias.

### Add or change an image

- Put public, content-addressed images in `public/` and reference them with a
  root-relative URL such as `/team/portraits/person.webp`.
- Put component-owned artwork in `src/assets/` and import it from TS/TSX.
- Do not put a `src/assets/...` path in JSON and expect Vite to transform it.
  JSON image values are rendered as raw browser URLs.
- Supply useful alternative text for meaningful images. Decorative images
  should use empty `alt` text in the component.

## Architecture summary

At application startup, JSON modules are imported and validated immediately by
`src/lib/content-repository.ts`. The repository hydrates recurring event dates,
sorts events and team members, and exposes defensive copies. Hooks read those
copies, pages compose the results, and React Router renders them inside the
shared application shell.

```text
src/data/*.json
      │
      ▼
content-validation.ts ── rejects malformed content during module load
      │
      ▼
content-repository.ts ── hydrates and sorts content
      │
      ▼
src/hooks/* ── memoized React-facing selectors
      │
      ▼
pages → feature components → UI primitives
```

Club content does not use network fetches. The account route is the sole runtime
API consumer and sends credentials only to the configured AnimeUNSW API.

## Contribution expectations

- Preserve strict TypeScript and avoid `any`.
- Keep content contracts, runtime validators, JSON data, and documentation in
  sync.
- Keep route pages focused on composition.
- Maintain keyboard navigation, visible focus, semantic headings, useful alt
  text, and reduced-motion behavior.
- Add or update tests for behavior changes.
- Do not edit generated `dist/` output by hand.
- Keep unrelated user changes intact and make focused commits.

See [docs/development.md](docs/development.md) for the full implementation
workflow.
