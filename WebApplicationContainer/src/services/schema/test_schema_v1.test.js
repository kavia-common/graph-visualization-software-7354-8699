import { validateDesign, migrateToLatest, getCurrentSchemaVersion } from '../schema';

describe('Schema v1 validation/migration', () => {
  const base = {
    meta: { v: 1, name: 'test' },
    nodes: [
      { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'A', collapsed: false } },
      { id: 'n2', position: { x: 10, y: 20 }, data: { label: 'B' }, group: 'g1' },
    ],
    edges: [{ id: 'e1', source: 'n1', target: 'n2', label: 'L' }],
  };

  test('getCurrentSchemaVersion returns 1', () => {
    expect(getCurrentSchemaVersion()).toBe(1);
  });

  test('validateDesign accepts valid v1 payloads with optional group/collapsed', () => {
    expect(() => validateDesign(base)).not.toThrow();
    const withGroupFlags = {
      ...base,
      nodes: [
        ...base.nodes,
        { id: 'g1', position: { x: 100, y: 0 }, data: { label: 'Group', groupCollapsed: true }, type: 'group' },
      ],
    };
    expect(() => validateDesign(withGroupFlags)).not.toThrow();
  });

  test('validateDesign rejects missing required keys', () => {
    const invalid = { nodes: [], edges: [] };
    expect(() => validateDesign(invalid)).toThrow(/Design validation failed/i);
  });

  test('migrateToLatest is no-op for v1', () => {
    const migrated = migrateToLatest(base);
    expect(migrated).toEqual(base);
  });
});
