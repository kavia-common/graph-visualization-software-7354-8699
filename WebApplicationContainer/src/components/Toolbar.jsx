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
      <button data-testid="toolbar-add-node" onClick={onAddNode} disabled={readOnly || busy} title="Add node (N)">+ Node</button>
      <button data-testid="toolbar-delete" onClick={onDelete} disabled={readOnly || busy} title="Delete (Del)">Delete</button>
      <button data-testid="toolbar-undo" className="secondary" onClick={onUndo} disabled={!canUndo || busy} title="Undo (Ctrl+Z)">Undo</button>
      <button data-testid="toolbar-redo" className="secondary" onClick={onRedo} disabled={!canRedo || busy} title="Redo (Ctrl+Y)">Redo</button>
      <span style={{ borderLeft: '1px solid var(--border-color)', height: 20, margin: '0 8px' }} />
      <button data-testid="toolbar-import" className="secondary" onClick={triggerImport} disabled={busy} title="Import JSON">Import</button>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={onFileChange} style={{ display: 'none' }} />
      {/* Maintain legacy test id plus new stable id */}
      <button data-testid="toolbar-export" data-testid-legacy="export-json" className="secondary" onClick={() => onExport({ gzip: false })} disabled={busy} title="Export JSON">Export</button>
      <button data-testid="toolbar-export-gz" data-testid-legacy="export-gz" className="secondary" onClick={() => onExport({ gzip: true })} disabled={busy} title="Export JSON .gz">Export (.gz)</button>
      <span style={{ borderLeft: '1px solid var(--border-color)', height: 20, margin: '0 8px' }} />
      <button data-testid="toolbar-toggle-readonly" className="secondary" onClick={onToggleReadOnly} disabled={busy} title="Toggle read-only">
        {readOnly ? 'Read-only' : 'Editable'}
      </button>
      <button data-testid="toolbar-shortcuts" className="secondary" onClick={onShowShortcuts} disabled={busy} title="Keyboard shortcuts">Shortcuts</button>
      <span style={{ borderLeft: '1px solid var(--border-color)', height: 20, margin: '0 8px' }} />
      <button data-testid="toolbar-backup" className="secondary" onClick={onBackup} disabled={busy} title="Manual backup to file">Backup</button>
      <button data-testid="toolbar-restore" className="secondary" onClick={triggerRestore} disabled={busy} title="Restore from file">Restore</button>
      <input ref={restoreInputRef} type="file" accept="application/json,application/gzip" onChange={onRestoreChange} style={{ display: 'none' }} />
      {busy && <span aria-live="polite" style={{ marginLeft: 8 }}>Working…</span>}
    </div>
  );
}
