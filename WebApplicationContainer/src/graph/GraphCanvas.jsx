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
import {
  canContain,
  isAllowedAtTopLevel,
  canAddChildWithCaps,
} from '../services/schema/containmentRules';

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

      // Determine drop position relative to canvas
      const bounds = containerRef.current?.getBoundingClientRect();
      const pos = {
        x: event.clientX - (bounds?.left ?? 0),
        y: event.clientY - (bounds?.top ?? 0),
      };

      // Normalize child type for robust validation
      const childTypeRaw = item.type;
      const childType = typeof childTypeRaw === 'string' ? childTypeRaw.toLowerCase() : childTypeRaw;

      // Helper to normalize any parent type-like value
      const norm = (t) => (typeof t === 'string' ? t.toLowerCase() : t);

      // Hit-testing: prefer the deepest valid parent under the pointer.
      // We approximate by checking RF nodes whose rendered rectangle contains the drop point.
      // React Flow stores node position; our rfNodes carry position only. We don't have width/height,
      // so we approximate containment by preferring a currently selected parent first (if single and valid),
      // else use the top-most node whose label box likely surrounds the point (fallback: any node).
      // To make this deterministic, we check selection first, then scan nodes by last rendered order (rfNodes as-is),
      // and pick the first that canContain(child).
      let parentId = null;
      let parentType = null;

      // Try selection preference if exactly one node is selected
      try {
        const selectedNodeIds = selection.filter((sid) => rfNodes.some((n) => n.id === sid));
        if (selectedNodeIds.length === 1) {
          const sid = selectedNodeIds[0];
          const parent = rfNodes.find((n) => n.id === sid);
          const pType = norm(parent?.data?.domainType || parent?.data?.type || parent?.type || null);
          if (pType && canContain(pType, childType)) {
            parentId = sid;
            parentType = pType;
          }
        }
      } catch {
        // ignore selection inference errors
      }

      // If no valid selection parent, try a simple spatial heuristic:
      // find any node whose visual area plausibly includes the pointer.
      // Since we don't track width/height, we use a radius around the node position.
      if (!parentId) {
        const HOVER_RADIUS = 80; // px heuristic
        // Check nodes in reverse order to prefer the visually top-most (assuming later entries render on top)
        const candidates = [...rfNodes].reverse().filter((n) => {
          const nx = n.position?.x ?? 0;
          const ny = n.position?.y ?? 0;
          const dx = pos.x - nx;
          const dy = pos.y - ny;
          const within = dx * dx + dy * dy <= HOVER_RADIUS * HOVER_RADIUS;
          if (!within) return false;
          const pType = norm(n?.data?.domainType || n?.data?.type || n.type || null);
          return pType && canContain(pType, childType);
        });
        if (candidates.length > 0) {
          const p = candidates[0];
          parentId = p.id;
          parentType = norm(p?.data?.domainType || p?.data?.type || p.type || null);
        }
      }

      // Validate containment matrix with normalization and caps
      if (parentId) {
        if (!canContain(parentType, childType)) {
          toast(`Cannot place a ${childType} inside ${parentType}.`, 'error');
          return;
        }
        // Enforce caps for specific parent/child combos (e.g., rack)
        const parentNode = rfNodes.find((n) => n.id === parentId);
        const siblingChildren = rfNodes.filter((n) => (n.data?.parentId || null) === parentId);
        const cap = canAddChildWithCaps(
          // map RF node to domain-ish shape
          {
            id: parentNode?.id,
            type: parentType,
            data: { domainType: parentType },
          },
          childType,
          siblingChildren.map((n) => ({
            id: n.id,
            type: norm(n.data?.domainType || n.data?.type || n.type),
            data: { ...n.data },
          }))
        );
        if (!cap.ok) {
          toast(cap.message || `Cannot add ${childType} due to parent constraints.`, 'error');
          return;
        }
      } else {
        // No parent determined: enforce top-level policy
        if (!isAllowedAtTopLevel(childType)) {
          toast(
            `Cannot create ${childType} at top-level. Drop onto a valid parent (e.g., site) or select it first.`,
            'error'
          );
          return;
        }
      }

      const id = `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      // Merge any default props from the palette item
      const defaultProps = (item && item.defaults) || {};
      // Map suggestedIndex to props.index for known indexed types
      let extraProps = {};
      if (typeof defaultProps.suggestedIndex !== 'undefined') {
        extraProps.index = defaultProps.suggestedIndex;
      }

      // If nested, adjust position to be relative to parent position
      let finalPos = { ...pos };
      if (parentId) {
        const p = rfNodes.find((n) => n.id === parentId);
        if (p?.position) {
          finalPos = {
            x: Math.max(0, pos.x - (p.position.x || 0)),
            y: Math.max(0, pos.y - (p.position.y || 0)),
          };
        }
      }

      const newNode = {
        id,
        position: finalPos,
        data: {
          label: item.label || childType,
          type: childType,
          domainType: childType, // surface domain type on data for parentType inference later
          parentId: parentId || null,
          imageUrl: item.imageUrl,
          props: { ...defaultProps, ...extraProps },
        },
        type: 'default',
      };

      // optimistic add
      setNodes((nds) => [...nds, newNode]);

      try {
        await apiCreateNode({
          id,
          type: childType,
          label: item.label || childType,
          position: finalPos,
          parentId: parentId || null,
          props: { ...defaultProps, ...extraProps },
          imageUrl: item.imageUrl,
          meta: item.meta || {},
        });
        // Success toast for user feedback
        if (parentId) {
          toast(`Added ${childType} inside ${parentType}.`, 'success');
        } else {
          toast(`Added ${childType} at top-level.`, 'success');
        }
      } catch (err) {
        if (err && !err.isNetwork && err.status !== 404) {
          const msg = err?.data?.message || 'Failed to save node to backend, rolling back.';
          toast(msg, 'error');
          setNodes((nds) => nds.filter((n) => n.id !== id));
        } else {
          toast('Backend unavailable; keeping local-only node.', 'warn');
        }
      }
    },
    [readOnly, selection, rfNodes, setNodes]
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
