import Dexie from 'dexie';

let db;

// PUBLIC_INTERFACE
export function initDB() {
  /** Initialize Dexie DB for autosave snapshots. */
  db = new Dexie('graph_editor_db');
  db.version(1).stores({
    snapshots: '++id, ts'
  });
  return db.open();
}

// PUBLIC_INTERFACE
export async function autosaveNow(design) {
  /** Insert a rolling snapshot. Keep only the latest 10. */
  if (!db) return;
  const ts = Date.now();
  await db.snapshots.add({ ts, data: design });
  const count = await db.snapshots.count();
  if (count > 10) {
    const oldest = await db.snapshots.orderBy('ts').first();
    if (oldest) await db.snapshots.delete(oldest.id);
  }
}

// PUBLIC_INTERFACE
export async function restoreLatest() {
  /** Restore the most recent snapshot, if any. */
  if (!db) return null;
  const latest = await db.snapshots.orderBy('ts').last();
  return latest?.data || null;
}
