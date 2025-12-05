import React from 'react';

// PUBLIC_INTERFACE
export default function Toolbar({
  onAddNode,
  onDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onImport,
  onExport,
  readOnly,
  onToggleReadOnly,
  onShowShortcuts,
  busy = false,
  onBackup,
  onRestore,
}) {
  /** Toolbar provides basic editing controls and import/export. */
  const fileInputRef = React.useRef(null);
  const restoreInputRef = React.useRef(null);

  const triggerImport = () => fileInputRef.current?.click();
  const triggerRestore = () => restoreInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = '';
  };

  const onRestoreChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onRestore(file);
    e.target.value = '';
  };

  return (
    <div className="toolbar" role="toolbar" aria-label="Graph editor toolbar">
      <button onClick={onAddNode} disabled={readOnly || busy} title="Add node (N)">+ Node</button>
      <button onClick={onDelete} disabled={readOnly || busy} title="Delete (Del)">Delete</button>
      <button className="secondary" onClick={onUndo} disabled={!canUndo || busy} title="Undo (Ctrl+Z)">Undo</button>
      <button className="secondary" onClick={onRedo} disabled={!canRedo || busy} title="Redo (Ctrl+Y)">Redo</button>
      <span style={{ borderLeft: '1px solid var(--border-color)', height: 20, margin: '0 8px' }} />
      <button className="secondary" onClick={triggerImport} disabled={busy} title="Import JSON">Import</button>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={onFileChange} style={{ display: 'none' }} />
      <button className="secondary" onClick={() => onExport({ gzip: false })} disabled={busy} title="Export JSON">Export</button>
      <button className="secondary" onClick={() => onExport({ gzip: true })} disabled={busy} title="Export JSON .gz">Export (.gz)</button>
      <span style={{ borderLeft: '1px solid var(--border-color)', height: 20, margin: '0 8px' }} />
      <button className="secondary" onClick={onToggleReadOnly} disabled={busy} title="Toggle read-only">
        {readOnly ? 'Read-only' : 'Editable'}
      </button>
      <button className="secondary" onClick={onShowShortcuts} disabled={busy} title="Keyboard shortcuts">Shortcuts</button>
      <span style={{ borderLeft: '1px solid var(--border-color)', height: 20, margin: '0 8px' }} />
      <button className="secondary" onClick={onBackup} disabled={busy} title="Manual backup to file">Backup</button>
      <button className="secondary" onClick={triggerRestore} disabled={busy} title="Restore from file">Restore</button>
      <input ref={restoreInputRef} type="file" accept="application/json,application/gzip" onChange={onRestoreChange} style={{ display: 'none' }} />
      {busy && <span aria-live="polite" style={{ marginLeft: 8 }}>Working…</span>}
    </div>
  );
}
