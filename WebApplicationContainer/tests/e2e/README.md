# E2E tests

- Install browsers and deps: `npm run e2e:install`
- Run tests: `npm run e2e`
- The config starts a dev server on :3000 if not already running.
- For CI stability you can serve the production build by setting `PLAYWRIGHT_USE_BUILD=1`.

Performance baseline tests include:
- Cold render budget (< 2s to toolbar visibility)
- Large-graph sanity (100 nodes within 8s budget on CI)

Selector guidance:
- Prefer getByRole or data-testid for selectors to reduce flakiness.
