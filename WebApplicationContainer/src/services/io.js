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

// PUBLIC_INTERFACE
export async function maybeGzip(text) {
  /** Optionally gzip text using CompressionStream if supported by browser. Returns Blob. */
  if ('CompressionStream' in window) {
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    const enc = new TextEncoder();
    await writer.write(enc.encode(text));
    await writer.close();
    const gzBlob = await new Response(cs.readable).blob();
    return gzBlob;
  }
  return new Blob([text], { type: 'application/json' });
}

// PUBLIC_INTERFACE
export function exportDesign(data, { gzip = false } = {}) {
  /** Export current design to a versioned JSON file with deterministic serialization. */
  const meta = { ...(data.meta || {}), v: getCurrentSchemaVersion(), exportedAt: new Date().toISOString() };
  const sorted = {
    ...data,
    meta,
    nodes: [...(data.nodes || [])].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...(data.edges || [])].sort((a, b) => a.id.localeCompare(b.id)),
  };
  const json = JSON.stringify(sorted, null, 2);
  const trigger = async () => {
    const blob = gzip ? await maybeGzip(json) : new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = gzip ? `graph-design-v${meta.v}.json.gz` : `graph-design-v${meta.v}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  // fire and forget for user click responsiveness
  trigger();
}
