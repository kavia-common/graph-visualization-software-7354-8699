import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../store/graphStore';
import { createNode as apiCreateNode, createEdge as apiCreateEdge } from '../services/api';
import { toast } from '../utils/toast';
import './GraphCanvas.css';

// PUBLIC_INTERFACE
export default function GraphCanvas({ onContextMenu }) {
  /**
   * GraphCanvas wraps React Flow and connects it to our store/history.
   * Supports pan/zoom, selection, node/edge creation, delete, and read-only mode.
   * Extended: Drag-and-drop from palette and edge linking with backend persistence.
   */
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    readOnly,
    selection,
    setSelection,
    customNodeTypes,
    customEdgeTypes,
  } = useGraphStore();

  const [rfNodes, rfSetNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, rfSetEdges, onEdgesChange] = useEdgesState(edges);

  const containerRef = useRef(null);

  React.useEffect(() => rfSetNodes(nodes), [nodes, rfSetNodes]);
  React.useEffect(() => rfSetEdges(edges), [edges, rfSetEdges]);

  const onConnect = useCallback(
    async (params) => {
      if (readOnly) return;
      const localId = `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      const nextEdge = { ...params, id: localId, animated: true };
      const next = addEdge(nextEdge, rfEdges);
      setEdges(next);
      // Persist
      try {
        await apiCreateEdge({
          id: localId,
          source: params.source,
          target: params.target,
          directed: true,
        });
      } catch (err) {
        if (err && !err.isNetwork && err.status !== 404) {
          toast('Failed to save edge to backend, rolling back.', 'error');
          // rollback
          setEdges((eds) => eds.filter((e) => e.id !== localId));
        } else {
          toast('Backend unavailable; working locally.', 'warn');
        }
      }
    },
    [rfEdges, setEdges, readOnly]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selNodes = [], edges: selEdges = [] }) => {
      setSelection([...selNodes.map((n) => n.id), ...selEdges.map((e) => e.id)]);
    },
    [setSelection]
  );

  const nodeTypes = useMemo(
    () => ({ ...customNodeTypes }),
    [customNodeTypes]
  );
  const edgeTypes = useMemo(
    () => ({ ...customEdgeTypes }),
    [customEdgeTypes]
  );

  // Handle DnD from SidebarPalette
  const onDrop = useCallback(
    async (event) => {
      event.preventDefault();
      if (readOnly) return;
      const data = event.dataTransfer.getData('application/x-graph-item');
      if (!data) return;
      let item;
      try {
        item = JSON.parse(data);
      } catch {
        return;
      }
      const bounds = containerRef.current?.getBoundingClientRect();
      const pos = {
        x: event.clientX - (bounds?.left ?? 0),
        y: event.clientY - (bounds?.top ?? 0),
      };
      const id = `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      const newNode = {
        id,
        position: pos,
        data: { label: item.label || item.type },
        type: 'default',
      };
      // optimistic add
      setNodes((nds) => [...nds, newNode]);
      try {
        await apiCreateNode({
          id,
          type: item.type,
          label: item.label || item.type,
          position: pos,
          props: {},
        });
      } catch (err) {
        if (err && !err.isNetwork && err.status !== 404) {
          toast('Failed to save node to backend, rolling back.', 'error');
          setNodes((nds) => nds.filter((n) => n.id !== id));
        } else {
          toast('Backend unavailable; working locally.', 'warn');
        }
      }
    },
    [readOnly, setNodes]
  );

  const onDragOver = useCallback((event) => {
    const types = event.dataTransfer?.types || [];
    if (Array.from(types).includes('application/x-graph-item')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  // Keyboard deletion
  const onKeyDown = useCallback(
    (e) => {
      if (readOnly) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setNodes((nds) => nds.filter((n) => !selection.includes(n.id)));
        setEdges((eds) => eds.filter((ed) => !selection.includes(ed.id)));
      }
    },
    [readOnly, selection, setNodes, setEdges]
  );

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      ref={containerRef}
      className="graph-canvas"
      tabIndex={0}
      onContextMenu={(e) => onContextMenu?.(e, { selection })}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={(changes) => {
          if (readOnly) return;
          onNodesChange(changes);
          setNodes((nds) => nds);
        }}
        onEdgesChange={(changes) => {
          if (readOnly) return;
          onEdgesChange(changes);
          setEdges((eds) => eds);
        }}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background variant="lines" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
