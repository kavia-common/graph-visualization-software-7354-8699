import React from 'react';
import { subscribeToast } from '../utils/toast';

export default function Toasts() {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    const unsub = subscribeToast((evt) => {
      if (evt.dismiss) {
        setItems((prev) => prev.filter((t) => t.id !== evt.id));
      } else {
        setItems((prev) => [...prev, evt]);
      }
    });
    return unsub;
  }, []);

  const typeToBg = (t) => {
    switch (t) {
      case 'error':
        return '#b91c1c';
      case 'warn':
      case 'warning':
        return '#d97706';
      case 'success':
        return '#059669';
      default:
        return '#374151';
    }
  };

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((t) => (
        <div
          key={t.id}
          style={{
            background: typeToBg(t.type),
            color: 'white',
            padding: '10px 12px',
            borderRadius: 6,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            maxWidth: 320,
            fontSize: 14,
          }}
          role="status"
          aria-live="polite"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
