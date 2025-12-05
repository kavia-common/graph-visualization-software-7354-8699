import Dexie from 'dexie';

let db;
let autosaveTimer = null;

// PUBLIC_INTERFACE
export function __testOnly_clearAutosaveTimer() {
  /** Clears pending autosave timer; intended for Jest cleanup. */
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
}

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
export function autosaveDebounced(design, delayMs = 800) {
  /** Debounced autosave wrapper to reduce IndexedDB churn while editing. */
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    const p = autosaveNow(design);
    // Ensure no unhandled rejections in tests
    if (p && typeof p.then === 'function' && typeof p.catch === 'function') {
      p.catch((e) => {
        // eslint-disable-next-line no-console
        if (process && process.env && process.env.NODE_ENV === 'test') {
          console.error('[autosave:catch]', e?.stack || e?.message || e);
        }
      });
    }
  }, delayMs);
}

// PUBLIC_INTERFACE
export async function restoreLatest() {
  /** Restore the most recent snapshot, if any. */
  if (!db) return null;
  const latest = await db.snapshots.orderBy('ts').last();
  return latest?.data || null;
}

// PUBLIC_INTERFACE
export async function manualBackup(design) {
  /** Save current design to file (JSON) for manual backup. */
  const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `graph-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// PUBLIC_INTERFACE
export async function manualRestore(file) {
  /** Restore from a user-provided backup file (JSON or .gz if supported by browser). */
  const arrayBuffer = await file.arrayBuffer();
  let text = '';
  if (file.name.endsWith('.gz') && 'DecompressionStream' in window) {
    const ds = new DecompressionStream('gzip');
    const decompressed = await new Response(new Blob([arrayBuffer]).stream().pipeThrough(ds)).text();
    text = decompressed;
  } else {
    text = new TextDecoder().decode(arrayBuffer);
  }
  try {
    const obj = JSON.parse(text);
    return obj;
  } catch (e) {
    console.error('Failed to parse backup:', e);
    return null;
  }
}
