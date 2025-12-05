/*
 * Service layer for backend calls using REACT_APP_BACKEND_URL,
 * with optional mock in-memory backend toggled by REACT_APP_USE_MOCK_API.
 */

const USE_MOCK =
  (typeof process !== 'undefined' &&
    process.env &&
    String(process.env.REACT_APP_USE_MOCK_API).toLowerCase() === 'true') ||
  false;

let mockApi = null;
if (USE_MOCK) {
  // Lazy import to avoid bundling cost when not used
  mockApi = require('./mockApi');
}

const BASE_URL =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL) ||
  (typeof window !== 'undefined' && window.__REACT_APP_BACKEND_URL__) ||
  '';

/**
 * Internal helper to build URLs.
 */
function buildUrl(path) {
  if (!BASE_URL) return path; // local-only mode if env not set
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Internal generic fetch wrapper with JSON handling and error normalization.
 */
async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const url = buildUrl(path);
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => null);
      } else {
        data = await res.text().catch(() => null);
      }
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    // Try parse json else return null
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    return null;
  } catch (e) {
    // Network/backend down or not configured: propagate a special marker
    const err = new Error(e.message || 'Network error');
    err.isNetwork = true;
    err.status = e.status;
    err.data = e.data;
    throw err;
  }
}

// PUBLIC_INTERFACE
export async function fetchPalette() {
  /**
   * Fetch palette from backend or mock.
   * Returns: [{type, label, icon?}, ...]
   */
  if (USE_MOCK && mockApi) {
    return mockApi.getPalette();
  }
  try {
    const data = await request('/palette');
    if (Array.isArray(data)) return data;
    // fallback if backend responds with unexpected shape
    return [
      { type: 'router', label: 'Router' },
      { type: 'switch', label: 'Switch' },
      { type: 'host', label: 'Host' },
    ];
  } catch (e) {
    // Fallback local palette
    return [
      { type: 'router', label: 'Router' },
      { type: 'switch', label: 'Switch' },
      { type: 'host', label: 'Host' },
      { type: 'link', label: 'Link Tool' },
    ];
  }
}

// PUBLIC_INTERFACE
export async function createNode(node) {
  /**
   * Create node via backend or mock.
   * On network error, throw to allow caller to decide on rollback/keep local.
   */
  if (USE_MOCK && mockApi) {
    return mockApi.createNode(node);
  }
  return request('/nodes', { method: 'POST', body: node });
}

// PUBLIC_INTERFACE
export async function updateNode(id, patch) {
  /**
   * Patch node via backend or mock.
   */
  if (USE_MOCK && mockApi) {
    return mockApi.updateNode(id, patch);
  }
  return request(`/nodes/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch });
}

// PUBLIC_INTERFACE
export async function createEdge(edge) {
  /**
   * Create edge via backend or mock.
   */
  if (USE_MOCK && mockApi) {
    return mockApi.createEdge(edge);
  }
  return request('/edges', { method: 'POST', body: edge });
}

// PUBLIC_INTERFACE
export function getBaseUrl() {
  /** Utility accessor for base URL for diagnostics. */
  if (USE_MOCK) return '(mock in-memory API)';
  return BASE_URL || '(local-only mode)';
}
