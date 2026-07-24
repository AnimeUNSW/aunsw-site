# Deployment

The repository produces a static Vite SPA. It does not currently contain a
provider-specific deployment workflow, domain configuration, or CI release
pipeline. Hosting setup therefore lives outside this repository unless one is
added later.

## Build artifact

Create a production build with:

```bash
npm ci
npm run build
```

Vite writes the deployable artifact to `dist/`. The directory is generated and
gitignored. Deploy the contents of `dist/`, not the repository source and not
the `dist` directory as an extra nested URL level.

Preview the artifact locally:

```bash
npm run preview
```

`preview` is a verification server, not a production server.

## Hosting requirements

Any static host is suitable if it provides:

- HTTPS;
- an index document at `/index.html`;
- immutable or long-lived caching for fingerprinted files under `/assets/`;
- conservative/no-cache behavior for `index.html`; and
- an SPA rewrite that serves `/index.html` for unknown application paths.

The SPA rewrite is essential for direct visits and refreshes on `/events`,
`/sponsors`, `/team`, and `/info`. Requests for real static files should still
return those files or a true 404 rather than HTML.

Conceptually:

```text
request matches an existing file → serve the file
all other application requests   → serve /index.html with HTTP 200
```

The React wildcard route then renders the site's not-found page for unknown
client routes.

## Base path

The current build assumes deployment at the origin root (`/`). Public asset URLs
and routes are root-relative. Deploying under a subdirectory such as
`example.edu/animeunsw/` requires coordinated changes:

- configure Vite's `base`;
- configure React Router's basename;
- replace or generate root-relative content asset URLs; and
- test every route and asset from the subdirectory.

Do not change only one of those settings.

## Assets

- Imported files under `src/assets/` are fingerprinted into `dist/assets/`.
- Files under `public/` are copied to equivalent root paths.
- JSON image strings remain literal URLs.

Before release, inspect the built site—not only the development server—for
missing event images, sponsor logos, portraits, fonts, and the hero layers.
Source-relative strings such as `../src/assets/...` are not production-safe.

## Environment and secrets

No environment variables are currently required. Everything shipped by Vite is
downloadable by visitors, including `VITE_*` variables. Never place API keys,
private tokens, credentials, or unpublished personal information in:

- `.env` values used by client code;
- JSON content;
- source files; or
- public assets.

If future functionality requires a secret, implement it behind a server-side
boundary rather than in this SPA.

## Pre-deployment checklist

- [ ] `npm ci` completes from the committed lockfile.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes and produces a fresh `dist/`.
- [ ] `npm run preview` renders every top-level route.
- [ ] A direct load/refresh on every route works in a host-like environment.
- [ ] Public images and bundled artwork load without 404s.
- [ ] Event dates, registration state, sponsor terms, and membership links are
      current.
- [ ] Mobile and desktop layouts work in light and dark themes.
- [ ] Keyboard navigation, focus, and reduced-motion behavior were checked.
- [ ] Page title, favicon, metadata, and canonical production details are
      appropriate for release.

## Post-deployment smoke test

1. Open `/` in a private window and follow both hero calls to action.
2. Refresh each top-level route directly.
3. Filter events and verify past events cannot register.
4. Open at least one external event, sponsor, social, and membership link.
5. Browse committee and subcommittee profiles on mobile.
6. Toggle light/dark mode and reload to verify persistence.
7. Check the browser console and network panel for errors and 404s.
8. Test a nonsense URL and confirm the in-app not-found page appears.

## Rollback

The hosting provider should retain the previous successful artifact or
deployment. If a release breaks navigation or content, restore that artifact
first, then diagnose and rebuild from source. Do not patch files directly in
`dist/` or on the host because such changes are not reproducible.
