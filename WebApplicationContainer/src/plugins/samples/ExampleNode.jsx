import React from 'react';

// PUBLIC_INTERFACE
export default function ExampleNode({ data }) {
  /** Example custom node renderer plugin. */
  return (
    <div style={{ padding: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid #6366f1', borderRadius: 6 }}>
      <strong>🔌 Plugin Node</strong>
      <div>{data?.label || 'Example'}</div>
    </div>
  );
}
