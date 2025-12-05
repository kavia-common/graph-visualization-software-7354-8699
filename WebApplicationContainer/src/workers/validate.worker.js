/* eslint-disable no-restricted-globals */
const ctx = (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window);

ctx.onmessage = async (evt) => {
  try {
    const { schema, data } = evt.data || {};
    // Very light validation: check required top-level keys to avoid bundling AJV inside the worker
    if (!data || typeof data !== 'object') throw new Error('Invalid data');
    const required = ['meta', 'nodes', 'edges'];
    const missing = required.filter((k) => !(k in data));
    if (missing.length) throw new Error('Missing keys: ' + missing.join(', '));
    ctx.postMessage({ ok: true, schema });
  } catch (e) {
    ctx.postMessage({ ok: false, error: e?.message || String(e) });
  }
};
