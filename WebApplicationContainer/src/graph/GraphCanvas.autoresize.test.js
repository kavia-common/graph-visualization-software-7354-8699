import React from 'react';
import { render } from '@testing-library/react';
import GraphCanvas from './GraphCanvas';
import { useGraphStore } from '../store/graphStore';

describe('GraphCanvas autoresize containers', () => {
  test('adding child beyond bounds expands parent with padding', async () => {
    const { setNodes } = useGraphStore.getState();
    // Seed a parent container (site) with minimal size and a child near edge
    setNodes([
      {
        id: 'p1',
        position: { x: 50, y: 50 },
        data: { label: 'Site', type: 'site', domainType: 'site' },
        type: 'default',
        width: 200,
        height: 150,
      },
      {
        id: 'c1',
        position: { x: 190, y: 130 }, // near parent's edge, so with assumed child size 100x60, will overflow
        data: { label: 'Building', type: 'building', domainType: 'building', parentId: 'p1' },
        type: 'default',
      },
    ]);

    // Mount GraphCanvas (handlers will recompute on effect when changes occur)
    render(<GraphCanvas />);

    // Allow microtasks and timers to run
    await new Promise((r) => setTimeout(r, 250));

    const parent = useGraphStore.getState().nodes.find((n) => n.id === 'p1');
    expect(parent.width).toBeGreaterThanOrEqual(300); // minWidth for site
    expect(parent.height).toBeGreaterThanOrEqual(220); // minHeight for site
  });
});
