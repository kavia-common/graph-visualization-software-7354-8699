import { validateDesign, migrateToLatest, getCurrentSchemaVersion } from './schema';

// PUBLIC_INTERFACE
export async function importDesign(file) {
  /** Import a design JSON file, validate, migrate, and return the design object. */
  const text = await file.text();
  const obj = JSON.parse(text);
  const migrated = migrateToLatest(obj);
  validateDesign(migrated);
  return migrated;
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Export failed (non-fatal):', err);
  } finally {
    try { URL.revokeObjectURL(url); } catch (_) {}
  }
}

// PUBLIC_INTERFACE
export async function maybeGzip(text) {
  /** Optionally gzip text using CompressionStream if supported by browser. Returns Blob. */
  if (typeof window !== 'undefined' && 'CompressionStream' in window) {
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    const enc = new TextEncoder();
    await writer.write(enc.encode(text));
    await writer.close();
    const gzBlob = await new Response(cs.readable).blob();
    return gzBlob;
  }
  return new Blob([text], { type: 'application/json;charset=utf-8' });
}

// PUBLIC_INTERFACE
export function exportDesign(data, { gzip = false } = {}) {
  /** Export current design to a versioned JSON file with deterministic serialization and Blob download. */
  const meta = { ...(data.meta || {}), v: getCurrentSchemaVersion(), exportedAt: new Date().toISOString() };
  const sorted = {
    ...data,
    meta,
    nodes: [...(data.nodes || [])].sort((a, b) => (a.id || '').localeCompare(b.id || '')),
    edges: [...(data.edges || [])].sort((a, b) => (a.id || '').localeCompare(b.id || '')),
  };
  const json = JSON.stringify(sorted, null, 2);

  Promise.resolve()
    .then(async () => {
      const blob = gzip ? await maybeGzip(json) : new Blob([json], { type: 'application/json;charset=utf-8' });
      const filename = gzip ? `graph-design-v${meta.v}.json.gz` : `graph-design-v${meta.v}.json`;
      triggerBlobDownload(blob, filename);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('Export failed (non-fatal):', err);
    });
}
