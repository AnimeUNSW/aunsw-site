# AI agent instructions

This file is the fast operational guide for AI coding agents. Humans should
start with `README.md`; agents should read both this file and the documentation
relevant to the task.

## Repository facts

- This is a static React 19 + TypeScript + Vite 7 SPA.
- There is no backend, database, authentication, runtime API, or current
  provider-specific deployment config.
- `@/` resolves to `src/`.
- Club content is in `src/data/*.json`.
- Content contracts are duplicated intentionally between
  `src/types/content.ts` and runtime parsers in
  `src/lib/content-validation.ts`.
- JSON is imported, validated, sorted, and exposed by
  `src/lib/content-repository.ts`.
- JSON image fields are raw browser URLs; prefer `/...` assets under `public/`.
- Generated `dist/` and installed `node_modules/` are not source.

## Read before changing

| Task                         | Required context                              |
| ---------------------------- | --------------------------------------------- |
| Any task                     | `README.md` and this file                     |
| Architecture or feature work | `docs/architecture.md`, `docs/development.md` |
| Content edits                | `docs/content-guide.md`                       |
| Tests or behavior changes    | `docs/testing.md`                             |
| Hosting or releases          | `docs/deployment.md`                          |

Inspect the actual implementation after reading documentation. If code and docs
disagree, do not guess silently: determine current behavior, make the requested
change, and update stale documentation.

## Change rules

- Preserve unrelated working-tree changes.
- Make the smallest coherent change in the correct architectural layer.
- Do not import JSON directly into pages or feature components.
- When changing a content field, update its TypeScript type, runtime validator,
  data, consumers, tests, and content documentation together.
- When adding a route, update route declarations, navigation if appropriate,
  route tests, the README route table, and deployment assumptions.
- Keep pages compositional; put reusable behavior in feature components or
  `src/lib/`.
- Use existing shadcn/Radix primitives and semantic design tokens.
- Preserve keyboard access, heading structure, alt text, focus visibility,
  reduced-motion behavior, and light/dark support.
- Do not add secrets or assume `VITE_*` values are private.
- Do not hand-edit `dist/`.

## Verification

Run the checks relevant during development, then all gates before handoff:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Report exact outcomes. If the baseline already fails, distinguish pre-existing
failures from failures introduced by the task. Do not describe a non-zero
command as passing.

For UI/content work, also inspect the affected route at mobile and desktop
widths, in light and dark themes, with keyboard navigation. For deployment work,
verify direct-route refreshes and production asset paths.

## Documentation contract

Documentation is maintained source. Update it whenever behavior, commands,
routes, schemas, architecture, hosting requirements, or maintenance steps
change. Prefer stable explanations and invariants over transient implementation
notes. Never record credentials, private contact details, or unapproved personal
information in documentation.
