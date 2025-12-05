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
}) {
  /** Toolbar provides basic editing controls and import/export. */
  const fileInputRef = React.useRef(null);

  const triggerImport = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = '';
  };

  return (
    <div className="toolbar" role="toolbar" aria-label="Graph editor toolbar">
      <button onClick={onAddNode} disabled={readOnly} title="Add node (N)">+ Node</button>
      <button onClick={onDelete} disabled={readOnly} title="Delete (Del)">Delete</button>
      <button className="secondary" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">Undo</button>
      <button className="secondary" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">Redo</button>
      <span style={{ borderLeft: '1px solid var(--border-color)', height: 20, margin: '0 8px' }} />
      <button className="secondary" onClick={triggerImport} title="Import JSON">Import</button>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={onFileChange} style={{ display: 'none' }} />
      <button className="secondary" onClick={onExport} title="Export JSON">Export</button>
      <span style={{ borderLeft: '1px solid var(--border-color)', height: 20, margin: '0 8px' }} />
      <button className="secondary" onClick={onToggleReadOnly} title="Toggle read-only">
        {readOnly ? 'Read-only' : 'Editable'}
      </button>
      <button className="secondary" onClick={onShowShortcuts} title="Keyboard shortcuts">Shortcuts</button>
    </div>
  );
}
