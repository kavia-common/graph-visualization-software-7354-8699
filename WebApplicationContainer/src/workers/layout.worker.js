/* eslint-disable no-restricted-globals */
const ctx = (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window);

ctx.onmessage = (evt) => {
  // Simple layout: spread nodes horizontally by index; echoes edges unchanged
  const { nodes = [], edges = [] } = evt.data || {};
  const spacing = 160;
  const updated = nodes.map((n, idx) => ({
    ...n,
    position: { x: (n.position?.x ?? 0) + idx * spacing, y: n.position?.y ?? 0 },
  }));
  ctx.postMessage({ nodes: updated, edges });
};
