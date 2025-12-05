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
export function exportDesign(data) {
  /** Export current design to a versioned JSON file with deterministic serialization. */
  const meta = { ...(data.meta || {}), v: getCurrentSchemaVersion(), exportedAt: new Date().toISOString() };
  const sorted = {
    ...data,
    meta,
    nodes: [...(data.nodes || [])].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...(data.edges || [])].sort((a, b) => a.id.localeCompare(b.id)),
  };
  const blob = new Blob([JSON.stringify(sorted, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `graph-design-v${meta.v}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
