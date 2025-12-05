import React from 'react';
import { fetchPalette, getBaseUrl } from '../services/api';
import { toast } from '../utils/toast';

const iconFor = (type) => {
  switch (type) {
    case 'router':
      return '🛣️';
    case 'switch':
      return '🎚️';
    case 'host':
      return '🖥️';
    case 'link':
      return '🔗';
    default:
      return '📦';
  }
};

export default function SidebarPalette() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchPalette();
        if (mounted) setItems(data);
        const base = getBaseUrl();
        if (!base || base === '(local-only mode)') {
          toast('Backend URL not configured, using local-only palette.', 'warn');
        }
      } catch (e) {
        toast('Failed to load palette; using defaults.', 'warn');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onDragStart = (e, item) => {
    e.dataTransfer.setData('application/x-graph-item', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside
      aria-label="Palette"
      style={{
        width: 220,
        borderRight: '1px solid #e5e7eb',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: '#fafafa',
        height: 'calc(100vh - 110px)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
        Palette {loading ? '(loading...)' : ''}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
        {items.map((it) => (
          <div
            key={it.type + (it.label || '')}
            draggable
            onDragStart={(e) => onDragStart(e, it)}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: 6,
              padding: '8px 10px',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'grab',
              userSelect: 'none',
            }}
            title={`Drag to canvas to create a ${it.label || it.type}`}
          >
            <span aria-hidden style={{ fontSize: 18 }}>{iconFor(it.type)}</span>
            <span style={{ fontSize: 14 }}>{it.label || it.type}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', fontSize: 11, color: '#6b7280' }}>
        Backend: {getBaseUrl()}
      </div>
    </aside>
  );
}
