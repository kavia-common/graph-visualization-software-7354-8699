import React from 'react';

// PUBLIC_INTERFACE
export default function ShortcutsOverlay({ onClose, standalone = false }) {
  /** Keyboard shortcuts help overlay. */
  const content = (
    <div style={{
      position: standalone ? 'relative' : 'fixed',
      inset: standalone ? 'auto' : 0,
      background: standalone ? 'transparent' : 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20
    }}>
      <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 16, borderRadius: 8, minWidth: 300 }}>
        <h3 style={{ marginTop: 0 }}>Keyboard Shortcuts</h3>
        <ul>
          <li>N: Add Node</li>
          <li>Delete: Delete Selection</li>
          <li>Ctrl+Z / Cmd+Z: Undo</li>
          <li>Ctrl+Y / Shift+Cmd+Z: Redo</li>
        </ul>
        {onClose && <button className="secondary" onClick={onClose}>Close</button>}
      </div>
    </div>
  );

  return content;
}
