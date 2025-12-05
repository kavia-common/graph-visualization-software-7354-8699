import React, { useCallback, useEffect, useState } from 'react';
import GraphCanvas from '../graph/GraphCanvas';
import Toolbar from '../components/Toolbar';
import ContextMenu from '../components/ContextMenu';
import HUD from '../components/HUD';
import { useGraphStore } from '../store/graphStore';
import { useHistory } from '../store/history';
import { importDesign, exportDesign } from '../services/io';
import { initDB, autosaveNow, restoreLatest } from '../services/persistence';
import { PluginRegistryProvider } from '../plugins/registry';
import ShortcutsOverlay from '../components/ShortcutsOverlay';

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

  useEffect(() => {
    initDB();
    restoreLatest().then((data) => {
      if (data) setGraph(data);
    });
  }, [setGraph]);

  // Snapshot autosave on changes (debounced in service)
  useEffect(() => {
    autosaveNow({ nodes, edges, meta: { v: 1 } });
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
    const data = await importDesign(file);
    setGraph(data);
    push('Import design');
  };

  const handleExport = () => {
    exportDesign({ nodes, edges, meta: { v: 1 } });
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
        />
        <div className="canvas-container" onContextMenu={(e) => e.preventDefault()}>
          <GraphCanvas onContextMenu={onContextMenu} />
          {contextMenu && (
            <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContext}>
              <button className="secondary" onClick={addBasicNode}>Add Node</button>
              {selection.length > 0 && <button onClick={deleteSelected}>Delete</button>}
              <button className="secondary" onClick={handleExport}>Export</button>
            </ContextMenu>
          )}
          <HUD />
        </div>
        {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
      </div>
    </PluginRegistryProvider>
  );
}
