import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { createModuleWorker } from '../workers/createWorker';
import EditorShell from './EditorShell';

// PUBLIC_INTERFACE
export default function GraphEditor() {
  /**
   * GraphEditor shell: holds toolbar, canvas (now via EditorShell), context menu, HUD,
   * and manages read-only toggle, import/export, and autosave/session-restore.
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

  // Experimental validate worker (uses factory to avoid import.meta parsing in Jest)
  useEffect(() => {
    const isTest =
      (typeof process !== 'undefined' &&
        process.env &&
        (process.env.NODE_ENV === 'test' || process.env.REACT_APP_NODE_ENV === 'test')) ||
      false;

    if (isTest || !experiments() || !featureEnabled('validate-worker')) {
      return;
    }

    try {
      const worker = createModuleWorker('../workers/validate.worker.js');
      if (!worker) return;
      worker.onmessage = (evt) => {
        const { ok, error } = evt.data || {};
        if (!ok && error) console.warn('Background validation error:', error);
        worker.terminate();
      };
      worker.postMessage({ schema: 'v1', data: { nodes, edges, meta: { v: 1 } } });
      return () => worker.terminate();
    } catch {
      // swallow errors in unsupported environments
    }
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

  const handleImport = useCallback(async (file) => {
    setBusy(true);
    try {
      const data = await importDesign(file);
      setGraph(data);
      push('Import design');
    } finally {
      setBusy(false);
    }
  }, [push, setGraph]);

  const handleExport = useCallback((opts = {}) => {
    exportDesign({ nodes, edges, meta: { v: 1 } }, opts);
  }, [nodes, edges]);

  const addBasicNode = useCallback(() => {
    addNode();
    push('Add node');
  }, [addNode, push]);

  const deleteSelected = useCallback(() => {
    removeSelected();
    push('Delete selection');
  }, [removeSelected, push]);

  const toggleReadOnly = useCallback(() => setReadOnly(!readOnly), [readOnly, setReadOnly]);

  const menuContent = useMemo(() => (
    <>
      <button className="secondary" onClick={addBasicNode}>Add Node</button>
      {selection.length > 0 && <button onClick={deleteSelected}>Delete</button>}
      <button className="secondary" onClick={() => handleExport({ gzip: false })}>Export</button>
      <button className="secondary" onClick={() => handleExport({ gzip: true })}>Export (.gz)</button>
    </>
  ), [selection.length, addBasicNode, deleteSelected, handleExport]);

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
          onShowShortcuts={useCallback(() => setShowShortcuts((s) => !s), [])}
          busy={busy}
          onBackup={useCallback(() => manualBackup({ nodes, edges, meta: { v: 1 } }), [nodes, edges])}
          onRestore={useCallback(async (file) => {
            setBusy(true);
            try {
              const data = await manualRestore(file);
              if (data) setGraph(data);
            } finally {
              setBusy(false);
            }
          }, [setGraph])}
        />
        <div className="canvas-container" onContextMenu={(e) => e.preventDefault()}>
          {/* Use new layout shell containing palette, canvas and properties panel */}
          <EditorShell />
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
