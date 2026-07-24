# Development guide

This guide covers implementation work. See [content-guide.md](content-guide.md)
for content-only edits and [architecture.md](architecture.md) for system design.

## Local setup

Use the lockfile to keep dependency resolution reproducible:

```bash
npm ci
npm run dev
```

Do not use `npm install` merely to set up the repository; it can rewrite the
lockfile. Use it intentionally when adding, removing, or upgrading a dependency,
and review both `package.json` and `package-lock.json`.

The development server uses Vite defaults unless overridden on the command
line. To expose it on the local network:

```bash
npm run dev -- --host
```

## Quality workflow

During implementation, run the narrowest relevant test in watch mode. Before
handoff, run the complete gates:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`build` runs TypeScript project references before Vite and is the strongest
single check for production compilation. It does not replace lint or behavior
tests. The standalone `typecheck` script invokes the root configuration and may
not surface every referenced-project error, so do not use it as a substitute
for `build`.

When a command fails:

1. read every reported error, not only the first;
2. determine whether it reproduces on the unchanged base revision;
3. fix failures caused by the current work;
4. report pre-existing failures with file names and error summaries; and
5. never claim a gate passed if it exited non-zero.

## Code conventions

The configured style is:

- strict TypeScript;
- ES modules;
- two-space indentation;
- double quotes;
- no semicolons;
- trailing commas where valid in ES5;
- 80-column preferred width;
- `@/` imports for modules under `src/`; and
- Tailwind classes ordered by the Prettier plugin.

Avoid `any`, unvalidated type assertions, and duplicated domain rules. Use
`import type` when an import is used only in the type system.

`npm run format` only targets `.ts` and `.tsx`. Format other file types
carefully using their existing style.

## Implementation patterns

### Pages and components

Route pages should compose sections and own only route-specific state. Put
reusable behavior in the nearest feature folder. Prefer named exports for
components; `App` is the existing default-export exception.

Before creating a primitive, check `src/components/ui/`. These modules wrap
Radix/shadcn behavior and are shared across the application. Do not embed club
content into a generic UI primitive.

Use `cn` from `src/lib/utils.ts` to combine conditional classes.

### Content and domain logic

Do not import JSON directly into a page or card. Add content access through the
repository and a hook so validation and sorting remain centralized.

Keep pure calculations in `src/lib/` and test them without rendering where
possible. Date-dependent functions should accept or mock time so tests remain
deterministic.

When changing a content field, synchronize:

- `src/types/content.ts`;
- `src/lib/content-validation.ts`;
- JSON data;
- repository/hooks/consumers;
- tests; and
- `docs/content-guide.md`.

### Routes

To add a navigable route, update both:

- `src/app/app-routes.tsx`; and
- `src/components/navigation/nav-items.ts`.

Then add a route test and update the README route table. Route components render
inside `AppShell`; do not add a second global header, footer, or main element.

### Styling

Use tokens from `src/index.css` so components work in both themes. Prefer
existing shared classes such as `page-container` over repeated layout strings.
Check narrow viewports because tabs, badges, navigation, and profile data can
contain long text.

Arbitrary Tailwind values are acceptable for one-off visual treatments, but
promote repeated values or patterns into tokens/classes. Do not edit generated
CSS under `dist/`.

### Theme behavior

`ThemeProvider` must remain above components that call `useTheme`. It:

- resolves the system theme via `matchMedia`;
- stores a user choice in `localStorage`;
- synchronizes storage changes across tabs;
- temporarily suppresses transitions during a switch; and
- supports the `d` keyboard shortcut outside form/editable elements.

Tests that render theme-aware components should use `renderWithProviders`.

### Accessibility

For every interactive change:

- choose the native semantic element first;
- retain visible focus treatment;
- add an accessible name to icon-only controls;
- check tab order and keyboard operation;
- maintain heading hierarchy;
- use `aria-live` only where dynamic updates require announcement;
- avoid motion when reduced motion is requested; and
- test color and information in both themes.

Do not remove Radix-provided attributes or behavior without understanding their
accessibility role.

## Adding a dependency

Before adding a package, confirm that React, the platform, Radix, or an existing
utility cannot already solve the problem. Then:

```bash
npm install <package>
```

For build/test-only tooling:

```bash
npm install --save-dev <package>
```

Review the dependency's browser impact, license, maintenance status, and
generated lockfile diff. Document any new runtime setup or developer command.

## Adding shadcn/ui primitives

The configuration in `components.json` uses:

- the `radix-nova` style;
- TypeScript/TSX;
- CSS variables;
- Lucide icons; and
- aliases rooted at `@/`.

Generate a component with:

```bash
npx shadcn@latest add <component>
```

Keep generated primitives in `src/components/ui/`, then run formatting, lint,
typecheck, and tests. Generated code is owned source after it enters the
repository, so review and maintain it like any other code.

## Debugging guide

### The app fails immediately with “Content validation failed”

The error path points to the malformed JSON field. Compare it with
`docs/content-guide.md` and the parser in `content-validation.ts`. Common causes
are a missing required field, an unsupported enum, or an incomplete event
schedule pair.

### An image works in development but not production

Inspect the rendered `src`. JSON strings are raw URLs. Move the image to
`public/` and use a root-relative path, or import component-owned artwork from
TS/TSX.

### A direct route returns the host's 404

The static host is missing an SPA fallback to `index.html`. See
[deployment.md](deployment.md).

### A component test throws “useTheme must be used within ThemeProvider”

Render through `renderWithProviders` or install the same provider explicitly
when the test intentionally needs custom setup.

### Date output differs by machine

Fixed event strings should include an explicit UTC offset. Recurring event
hydration uses the executing environment's local timezone. Set fake system time
and, where needed, a known test timezone for deterministic date tests.

## Review checklist

- [ ] The change is in the correct architectural layer.
- [ ] Content types and runtime validators still agree.
- [ ] No raw JSON asset path relies on `src/`.
- [ ] Internal navigation uses React Router links.
- [ ] External links use safe target/rel behavior.
- [ ] Loading, empty, disabled, and error states are considered.
- [ ] Keyboard, reduced motion, mobile layout, and both themes were checked.
- [ ] Tests cover changed behavior.
- [ ] All quality gates were run and their true results reported.
- [ ] Relevant documentation was updated.
