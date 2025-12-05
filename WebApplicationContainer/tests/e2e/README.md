# E2E tests

- Run `npm run e2e` to execute Playwright tests. The config starts a dev server on :3000 if not already running.
- Performance baseline tests include:
  - Cold render budget (< 2s to toolbar visibility)
  - Large-graph sanity (100 nodes within 8s budget on CI)
- Optional Lighthouse CI config is provided in `lighthouserc.json`. To use it:
  1. Build the app: `npm run build`
  2. Serve: `npm run serve:prod`
  3. Run LHCI with your CI setup (install `@lhci/cli` in CI environment).
