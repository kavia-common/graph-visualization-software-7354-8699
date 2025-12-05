# Graph Visualization and Editing SPA (Phase 1)

- React + React Flow editor with pan/zoom, selection, node/edge creation
- Read-only toggle, undo/redo (labeled), import/export JSON (v1 schema)
- IndexedDB autosave and session restore (Dexie)
- Plugin registry with example node/edge renderers
- Storybook, TypeDoc, Jest/RTL, and Playwright scaffolding
- Dockerfile using Caddy for static serving with CSP

Scripts:
- npm start
- npm test
- npm run build
- npm run storybook
- npm run e2e (ensure server on :3000 or let Playwright start it)
