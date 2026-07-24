# Architecture

This document explains the boundaries and invariants of the AnimeUNSW site.
For setup and commands, see [development.md](development.md). For JSON field
definitions, see [content-guide.md](content-guide.md).

## System boundary

The site is a browser-only React SPA. Its production artifact is a directory of
static HTML, CSS, JavaScript, fonts, and images. The repository contains:

- no API server;
- no database or CMS;
- no authentication or authorization;
- no server-rendered routes;
- no environment-variable contract; and
- no analytics or third-party runtime SDK.

External URLs in content—Discord, Instagram, Rubric, sponsor sites, and event
registration—are ordinary links. The site does not proxy or validate them.

## Runtime composition

`src/main.tsx` mounts the application into `#root` under React `StrictMode` and
`ThemeProvider`. `src/App.tsx` then installs the tooltip provider, browser
router, application shell, and route tree.

```text
StrictMode
└── ThemeProvider
    └── App
        └── TooltipProvider
            └── BrowserRouter
                └── AppShell
                    ├── skip link
                    ├── Header
                    ├── AppRoutes
                    └── Footer
```

`AppShell` also resets scroll position after a pathname change. The main content
element has the stable `#main-content` target used by the keyboard skip link.

## Routing

All routes are defined in `src/app/app-routes.tsx`. The navigation model in
`src/components/navigation/nav-items.ts` is intentionally separate so desktop
and mobile navigation share the same labels and order.

When adding a top-level page:

1. Create a route-level component under `src/pages/`.
2. Register it in `AppRoutes`.
3. Add a `NAV_ITEMS` entry if it belongs in primary navigation.
4. Add a route rendering test to `src/tests/pages/app-routes.test.tsx`.
5. Confirm the static host falls back to `index.html` for the new path.
6. Update the route table in the root README.

The wildcard route renders an in-app not-found page. It only works when the
host first serves `index.html`; host-level 404 behavior is covered in
[deployment.md](deployment.md).

## Content subsystem

### Contracts and validation

Content has two complementary contracts:

- `src/types/content.ts` defines the compile-time TypeScript interfaces.
- `src/lib/content-validation.ts` validates imported JSON at runtime.

JSON imports are typed too loosely to protect against malformed editorial
changes on their own. For that reason, every field used by the UI must remain
covered by the runtime parser. When a field changes, update all of the
following:

1. the interface in `src/types/content.ts`;
2. its parser in `src/lib/content-validation.ts`;
3. the relevant JSON data;
4. consumers and tests; and
5. the schema table in `docs/content-guide.md`.

Validation happens synchronously when `content-repository.ts` is imported. A
malformed content record therefore prevents the application or test importing
the repository from starting and produces a path-specific
`Content validation failed: ...` error.

### Repository behavior

`src/lib/content-repository.ts` is the only module that directly imports every
content file. At module initialization it:

1. parses all content;
2. converts recurring weekday/time strings to the next occurrence;
3. sorts featured, upcoming, and past events;
4. sorts team profiles by `displayOrder`; and
5. stores the resulting arrays behind a small `ContentRepository` interface.

Getter functions return new top-level arrays or objects. Treat all returned
records as immutable even though nested values are not deeply cloned.

Recurring dates are calculated once per module load, not on every render.
Refreshing or rebuilding recalculates them. The calculation uses the browser or
build process's local timezone before converting the result to ISO.

Event ordering is:

1. featured events;
2. non-featured upcoming events;
3. non-featured past events;
4. within each group, closest to the current time first.

Featured status takes precedence over whether an event has passed.

### Hooks and selectors

Files under `src/hooks/` are thin, memoized React adapters:

- `useSiteContent` returns the singleton site record.
- `useSponsors` and `useTeamProfiles` return ordered arrays.
- `useFaqs` optionally filters by FAQ category.
- `useEvents` adds a computed `past` category and optionally filters.
- `useFeaturedEvents` takes the first featured records up to a limit.

Business rules belong in `src/lib/` or the repository, not duplicated inside
multiple components.

## Component ownership

| Layer                        | Responsibility                                          | Should not own                           |
| ---------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| `src/pages/`                 | Route-level composition and page-specific state         | Generic UI primitives or content parsing |
| `src/components/<feature>/`  | Domain presentation and interaction                     | Cross-feature global state               |
| `src/components/layout/`     | Persistent header, footer, main region, scroll behavior | Page-specific content                    |
| `src/components/navigation/` | Navigation model, desktop/mobile controls, theme toggle | Route content                            |
| `src/components/shared/`     | Reusable site-specific presentation                     | Low-level Radix wrappers                 |
| `src/components/ui/`         | shadcn/Radix primitives                                 | Club business rules                      |
| `src/hooks/`                 | React-facing content selectors                          | Parsing or DOM rendering                 |
| `src/lib/`                   | Pure or framework-light domain utilities                | Page composition                         |

Prefer extending the narrowest existing layer. For example, an event badge rule
belongs in `components/events` or `lib/events`, while a reusable card primitive
belongs in `components/ui`.

## State and browser behavior

The application deliberately has little state:

- React Router owns the current location.
- `ThemeProvider` owns `light`, `dark`, or `system`, persisted under the
  `localStorage` key `theme`.
- Pressing `d` outside an editable control toggles the resolved theme.
- Event tabs own the selected event category.
- Team browsers own the active profile and touch position.
- Team autoplay advances every 6.5 seconds and resets after manual navigation.

There is no external state store. Do not introduce one for isolated component
state.

Components that call `useTheme` must render below `ThemeProvider`. Tests should
normally use the shared `renderWithProviders` helper.

## Styling and design system

`src/index.css` is the Tailwind entry and design-token source. It imports:

- Tailwind CSS;
- animation utilities;
- shadcn styles;
- Geist and Orbitron fonts; and
- `src/styles/layout.css`.

Light and dark colors are CSS custom properties expressed in OKLCH.
`@theme inline` exposes those properties to Tailwind utilities. Shared layout
classes are intentionally small:

- `.page-container` constrains width and horizontal padding;
- `.page-divider-accent` provides the gradient divider; and
- `.page-stack` provides standard vertical rhythm.

Use semantic tokens such as `bg-card`, `text-muted-foreground`, and
`border-primary/20` instead of hard-coded light-only colors. Preserve the
Prettier Tailwind plugin's class ordering.

The home hero is an exception to ordinary content images. Its matched background
and character artwork are imported from `src/assets/banner/`. If `hero.image`
is provided in site JSON, the component uses that raw URL and intentionally
omits the matched character layer.

## Assets

There are two asset pipelines:

| Location      | How it is referenced                           | Build behavior                   |
| ------------- | ---------------------------------------------- | -------------------------------- |
| `src/assets/` | Static ES import from TS/TSX                   | Vite fingerprints and bundles it |
| `public/`     | Root-relative URL such as `/sponsors/logo.png` | Copied unchanged to `dist/`      |

String paths from JSON are not Vite imports. Use public root-relative URLs for
new JSON-managed images. A path such as `../src/assets/image.png` may appear to
work from a development URL but is not a reliable production asset.

## Accessibility invariants

The existing structure establishes these expectations:

- preserve the skip link and `#main-content`;
- keep one useful top-level page heading;
- use native links for navigation and buttons for actions;
- expose active navigation with `aria-current="page"`;
- provide labels for icon-only controls;
- provide meaningful alt text for content images and empty alt text for
  decorative layers;
- preserve keyboard operation inherited from Radix components;
- do not encode information by color alone; and
- respect `prefers-reduced-motion`, especially in the hero.

When changing an interaction, test it by keyboard as well as pointer.

## Extension points

### Adding a content collection

Define its type, validator, JSON file, repository getter, hook, components, and
tests in that order. Keeping one path through the content repository makes
validation and future CMS migration straightforward.

### Replacing JSON with a CMS or API

The `ContentRepository` interface is the intended seam. A remote implementation
would also require asynchronous loading, error states, caching, and tests;
current getters and hooks are synchronous. Do not add network fetching to
individual cards or pages.

### Adding environment configuration

No variables are currently required. If configuration is introduced, use
Vite's public `VITE_` prefix only for values safe to expose to every visitor.
Document the variable, default, and deployment setup; never place secrets in a
client bundle.
