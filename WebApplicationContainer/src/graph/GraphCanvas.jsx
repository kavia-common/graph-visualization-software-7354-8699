import React, { useCallback, useMemo, useRef } from 'react';
import ReactFlow, { addEdge, MiniMap, Controls, Background, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../store/graphStore';
import { useHistory } from '../store/history';
import { usePlugins } from '../plugins/registry';
import { featureEnabled, experiments, counter } from '../perf/metrics';

// PUBLIC_INTERFACE
export default function GraphCanvas({ onContextMenu }) {
  /**
   * GraphCanvas wraps React Flow and connects it to our store/history.
   * Supports pan/zoom, selection, node/edge creation, delete, and read-only mode.
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

  const { push } = useHistory();
  const plugins = usePlugins();

  const [rfNodes, rfSetNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, rfSetEdges, onEdgesChange] = useEdgesState(edges);
  const containerRef = useRef(null);

  React.useEffect(() => rfSetNodes(nodes), [nodes, rfSetNodes]);
  React.useEffect(() => rfSetEdges(edges), [edges, rfSetEdges]);

  // Experimental layout worker to spread out nodes
  React.useEffect(() => {
    const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';
    const canUseWorker = typeof Worker !== 'undefined' && typeof URL !== 'undefined';
    if (isTest || !canUseWorker) return;

    if (!experiments() || !featureEnabled('layout-worker')) return;
    if (!nodes?.length) return;
    counter('layout_runs', 1);
    const worker = new Worker(new URL('../workers/layout.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (evt) => {
      const { nodes: laidOut } = evt.data || {};
      if (Array.isArray(laidOut)) {
        setNodes(laidOut);
      }
      worker.terminate();
    };
    worker.postMessage({ nodes, edges });
    return () => worker.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes?.length]);

  const onConnect = useCallback(
    (params) => {
      if (readOnly) return;
      const next = addEdge({ ...params, animated: true }, rfEdges);
      setEdges(next);
      push('Connect edge');
    },
    [rfEdges, setEdges, push, readOnly]
  );

  const onNodeDragStop = useCallback(() => {
    push('Move node');
  }, [push]);

  const onSelectionChange = useCallback(
    ({ nodes: selNodes = [], edges: selEdges = [] }) => {
      setSelection([...selNodes.map((n) => n.id), ...selEdges.map((e) => e.id)]);
    },
    [setSelection]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (readOnly) return;
      if (e.key.toLowerCase() === 'n') {
        // Quick-add node near viewport origin
        setNodes((nds) => [
          ...nds,
          {
            id: Math.random().toString(36).slice(2, 10),
            position: { x: 80 + nds.length * 12, y: 100 },
            data: { label: `Node ${nds.length + 1}` },
            type: 'default',
          },
        ]);
        push('Add node (keyboard)');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        setNodes((nds) => nds.filter((n) => !selection.includes(n.id)));
        setEdges((eds) => eds.filter((ed) => !selection.includes(ed.id)));
        push('Delete selection (keyboard)');
      }
    },
    [readOnly, selection, setNodes, setEdges, push]
  );

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const nodeTypes = useMemo(
    () => ({ ...plugins.nodeTypes, ...customNodeTypes }),
    [plugins.nodeTypes, customNodeTypes]
  );
  const edgeTypes = useMemo(
    () => ({ ...plugins.edgeTypes, ...customEdgeTypes }),
    [plugins.edgeTypes, customEdgeTypes]
  );

  return (
    <div
      ref={containerRef}
      style={{ height: 'calc(100vh - 110px)', outline: 'none' }}
      tabIndex={0}
      onContextMenu={(e) => onContextMenu?.(e, { selection })}
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
        onNodeDragStop={onNodeDragStop}
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
