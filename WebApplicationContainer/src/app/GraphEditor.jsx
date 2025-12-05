import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GraphCanvas from '../graph/GraphCanvas';
import Toolbar from '../components/Toolbar';
import ContextMenu from '../components/ContextMenu';
import HUD from '../components/HUD';
import { useGraphStore } from '../store/graphStore';
import { useHistory } from '../store/history';
import { importDesign, exportDesign } from '../services/io';
import { initDB, autosaveDebounced, restoreLatest, manualBackup, manualRestore } from '../services/persistence';
import { PluginRegistryProvider } from '../plugins/registry';
import ShortcutsOverlay from '../components/ShortcutsOverlay';
import { experiments, featureEnabled } from '../perf/metrics';

// PUBLIC_INTERFACE
export default function GraphEditor() {
  /**
   * GraphEditor shell: holds toolbar, canvas, context menu, HUD, and manages
   * read-only toggle, import/export, and autosave/session-restore.
   */
  const {
    nodes,
    edges,
    setGraph,
    readOnly,
    setReadOnly,
    addNode,
    removeSelected,
    selection,
  } = useGraphStore();

  const { undo, redo, canUndo, canRedo, push } = useHistory();

  const [contextMenu, setContextMenu] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    initDB();
    restoreLatest().then((data) => {
      if (data) setGraph(data);
    });
  }, [setGraph]);

  // Snapshot autosave on changes (debounced in service)
  useEffect(() => {
    autosaveDebounced({ nodes, edges, meta: { v: 1 } });
  }, [nodes, edges]);

  // Experimental validate worker
  useEffect(() => {
    // Skip in test environments or if Worker/new URL is not supported
    const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';
    const canUseWorker = typeof Worker !== 'undefined' && typeof URL !== 'undefined';
    if (isTest || !canUseWorker) return;

    if (!experiments() || !featureEnabled('validate-worker')) return;
    try {
      // Guard import.meta.url access by constructing URL only when available
      const worker = new Worker(new URL('../workers/validate.worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = (evt) => {
        // eslint-disable-next-line no-unused-vars
        const { ok, error } = evt.data || {};
        // For now, surface errors to console to avoid intrusive UI
        if (!ok && error) console.warn('Background validation error:', error);
        worker.terminate();
      };
      worker.postMessage({ schema: 'v1', data: { nodes, edges, meta: { v: 1 } } });
      return () => worker.terminate();
    } catch {}
  }, [nodes, edges]);

  const onContextMenu = useCallback((evt, payload) => {
    evt.preventDefault();
    setContextMenu({
      x: evt.clientX,
      y: evt.clientY,
      payload,
    });
  }, []);

  const closeContext = useCallback(() => setContextMenu(null), []);

  const handleImport = async (file) => {
    setBusy(true);
    try {
      const data = await importDesign(file);
      setGraph(data);
      push('Import design');
    } finally {
      setBusy(false);
    }
  };

  const handleExport = (opts = {}) => {
    exportDesign({ nodes, edges, meta: { v: 1 } }, opts);
  };

  const addBasicNode = () => {
    addNode();
    push('Add node');
  };

  const deleteSelected = () => {
    removeSelected();
    push('Delete selection');
  };

  const toggleReadOnly = () => setReadOnly(!readOnly);

  const menuContent = useMemo(() => (
    <>
      <button className="secondary" onClick={addBasicNode}>Add Node</button>
      {selection.length > 0 && <button onClick={deleteSelected}>Delete</button>}
      <button className="secondary" onClick={() => handleExport({ gzip: false })}>Export</button>
      <button className="secondary" onClick={() => handleExport({ gzip: true })}>Export (.gz)</button>
    </>
  ), [selection.length]);

  return (
    <PluginRegistryProvider>
      <div className="editor-shell" role="main" aria-label="Graph editor">
        <Toolbar
          onAddNode={addBasicNode}
          onDelete={deleteSelected}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onImport={handleImport}
          onExport={handleExport}
          readOnly={readOnly}
          onToggleReadOnly={toggleReadOnly}
          onShowShortcuts={() => setShowShortcuts((s) => !s)}
          busy={busy}
          onBackup={() => manualBackup({ nodes, edges, meta: { v: 1 } })}
          onRestore={async (file) => {
            setBusy(true);
            try {
              const data = await manualRestore(file);
              if (data) setGraph(data);
            } finally {
              setBusy(false);
            }
          }}
        />
        <div className="canvas-container" onContextMenu={(e) => e.preventDefault()}>
          <GraphCanvas onContextMenu={onContextMenu} />
          {contextMenu && (
            <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContext}>
              {menuContent}
            </ContextMenu>
          )}
          <HUD />
        </div>
        {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
      </div>
    </PluginRegistryProvider>
  );
}
