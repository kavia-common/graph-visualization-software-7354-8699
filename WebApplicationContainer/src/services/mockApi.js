import { canContain, isAllowedAtTopLevel } from './schema/containmentRules';

const USE_DELAY_MS = (() => {
  const v = Number(process?.env?.REACT_APP_MOCK_DELAY_MS);
  if (Number.isFinite(v) && v >= 0) return Math.min(Math.max(v, 0), 2000);
  return 120; // default realistic small delay
})();

const ERROR_RATE = (() => {
  const v = Number(process?.env?.REACT_APP_MOCK_ERROR_RATE);
  if (Number.isFinite(v) && v >= 0 && v <= 1) return v;
  return 0; // default 0 = no random errors
})();

// In-memory stores for the session
const memory = {
  nodes: new Map(), // id -> node
  edges: new Map(), // id -> edge
  counters: { n: 0, e: 0 },
};

// Seed palette
const seededPalette = [
  { id: 'router', type: 'router', label: 'Router', icon: 'router' },
  { id: 'switch', type: 'switch', label: 'Switch', icon: 'switch' },
  { id: 'link', type: 'link', label: 'Link', icon: 'link' },
];

// Utility delay + error simulation
function maybeFail() {
  if (Math.random() < ERROR_RATE) {
    const err = new Error('Mock API simulated error');
    err.isMock = true;
    err.status = 500;
    throw err;
  }
}

function delay(ms = USE_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextNodeId() {
  memory.counters.n += 1;
  return `n${memory.counters.n}`;
}

function nextEdgeId() {
  memory.counters.e += 1;
  return `e${memory.counters.e}`;
}

// PUBLIC_INTERFACE
export async function getPalette() {
  /** Returns the seeded palette items. */
  await delay();
  maybeFail();
  return seededPalette.slice();
}

import { canContain, isAllowedAtTopLevel } from './schema/containmentRules';

// PUBLIC_INTERFACE
export async function createNode(payload) {
  /**
   * Create a node in memory.
   * payload: { id?, type, label, position, props, parentId? }
   * Validates containment if parentId provided. If parentId is null/undefined, only allow TOP_LEVEL_TYPES.
   * Returns persisted node: { id, ...payload }
   */
  await delay();
  maybeFail();

  const { type, parentId } = payload || {};
  if (!type) {
    const err = new Error('Invalid payload: type is required');
    err.status = 400;
    err.data = { message: 'type is required' };
    throw err;
  }

  // Resolve parent type if parentId supplied
  if (parentId) {
    const parent = memory.nodes.get(parentId);
    if (!parent) {
      const err = new Error('Parent not found');
      err.status = 400;
      err.data = { message: `Parent '${parentId}' not found` };
      throw err;
    }
    const parentType = parent.type || parent?.data?.type || parent?.data?.domainType || null;
    if (!canContain(parentType, type)) {
      const err = new Error('Invalid placement');
      err.status = 400;
      err.data = { message: `Cannot place a ${type} inside ${parentType}` };
      throw err;
    }
  } else {
    // top-level creation must be explicitly allowed
    if (!isAllowedAtTopLevel(type)) {
      const err = new Error('Invalid top-level type');
      err.status = 400;
      err.data = { message: `Cannot create ${type} at top-level` };
      throw err;
    }
  }

  const id = payload.id || nextNodeId();
  const node = { id, ...payload };
  memory.nodes.set(id, node);
  return node;
}

// PUBLIC_INTERFACE
export async function updateNode(id, patch) {
  /**
   * Update a node by id with shallow merge semantics.
   */
  await delay();
  maybeFail();
  const existing = memory.nodes.get(id);
  if (!existing) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  const updated = {
    ...existing,
    ...patch,
    props: { ...(existing.props || {}), ...(patch?.props || {}) },
  };
  memory.nodes.set(id, updated);
  return updated;
}

// PUBLIC_INTERFACE
export async function getNode(id) {
  /** Optional debug helper to fetch a node by id. */
  await delay();
  const n = memory.nodes.get(id);
  if (!n) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  return { ...n };
}

// PUBLIC_INTERFACE
export async function listNodes() {
  /** Optional debug helper to list nodes. */
  await delay();
  return Array.from(memory.nodes.values()).map((n) => ({ ...n }));
}

// PUBLIC_INTERFACE
export async function createEdge(payload) {
  /**
   * Create an edge in memory.
   * payload: { id?, source, target, directed? }
   */
  await delay();
  maybeFail();
  const id = payload.id || nextEdgeId();
  const edge = { id, ...payload };
  memory.edges.set(id, edge);
  return edge;
}

// PUBLIC_INTERFACE
export async function getEdge(id) {
  /** Optional debug helper to fetch an edge by id. */
  await delay();
  const e = memory.edges.get(id);
  if (!e) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  return { ...e };
}

// PUBLIC_INTERFACE
export async function listEdges() {
  /** Optional debug helper to list edges. */
  await delay();
  return Array.from(memory.edges.values()).map((e) => ({ ...e }));
}
