import { initDB, autosaveNow, restoreLatest } from './persistence';

function mockIndexedDB() {
  // Very tiny in-memory Dexie-like shim for tests environment
  const store = [];
  return {
    version: () => ({ stores: () => {} }),
    open: () => Promise.resolve(),
    snapshots: {
      add: ({ ts, data }) => {
        store.push({ id: store.length + 1, ts, data });
        return Promise.resolve(store.length);
      },
      count: () => Promise.resolve(store.length),
      orderBy: (field) => ({
        last: () => Promise.resolve(store.slice().sort((a, b) => a.ts - b.ts).at(-1) || null),
        first: () => Promise.resolve(store.slice().sort((a, b) => a.ts - b.ts)[0] || null),
      }),
      delete: (id) => {
        const i = store.findIndex((x) => x.id === id);
        if (i >= 0) store.splice(i, 1);
        return Promise.resolve();
      },
    },
  };
}

jest.mock('dexie', () => {
  return jest.fn().mockImplementation(() => mockIndexedDB());
});

describe('persistence autosave/restore', () => {
  beforeAll(async () => {
    await initDB();
  });

  test('autosave and restore latest returns last snapshot', async () => {
    const d1 = { meta: { v: 1 }, nodes: [{ id: 'a', position: { x: 0, y: 0 }, data: {} }], edges: [] };
    const d2 = { meta: { v: 1 }, nodes: [{ id: 'b', position: { x: 1, y: 1 }, data: {} }], edges: [] };
    await autosaveNow(d1);
    await autosaveNow(d2);
    const restored = await restoreLatest();
    expect(restored).toEqual(d2);
  });
});
