# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Graph Editor Backend Integration

- Left palette sidebar is fetched from backend using REACT_APP_BACKEND_URL at GET /palette; falls back to local-only palette if backend is missing/unavailable.
- Nodes created by drag-and-drop are optimistically added and persisted via POST /nodes.
- Edges created by connecting nodes are optimistically added and persisted via POST /edges.
- Right-side properties panel allows editing node fields and saves via PATCH /nodes/:id (optimistic with rollback on failure).

### Mock Backend Mode (In-Memory)

For local demos without a real backend, enable the mock in-memory backend:

1) Copy .env.example to .env and set:
```
REACT_APP_USE_MOCK_API=true
REACT_APP_MOCK_ERROR_RATE=0
REACT_APP_MOCK_DELAY_MS=150
```

2) Start the app as usual (`npm start`).

When enabled, the app routes API calls to an in-memory store:
- GET /palette -> seeded items: Router, Switch, Link
- POST /nodes -> creates nodes in memory (ids like n1, n2…)
- PATCH /nodes/:id -> updates nodes in memory
- POST /edges -> creates edges in memory (ids like e1, e2…)

Notes:
- Data persists for the duration of the browser session (in-memory only).
- You can adjust REACT_APP_MOCK_ERROR_RATE to simulate random failures.
- `Backend:` indicator in the palette will show “(mock in-memory API)”.

Environment:

Set REACT_APP_BACKEND_URL in a .env file at build time (or use .env.example):

```
REACT_APP_BACKEND_URL=https://your-backend.example.com
```

If not set or the backend is down, the app continues in local-only mode and shows a non-blocking toast. Alternatively, enable the mock mode as above for a richer local demo experience.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
