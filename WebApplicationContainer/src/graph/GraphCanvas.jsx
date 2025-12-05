import React, { useCallback, useMemo } from 'react';
import ReactFlow, { addEdge, MiniMap, Controls, Background, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../store/graphStore';
import { useHistory } from '../store/history';
import { usePlugins } from '../plugins/registry';

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

  React.useEffect(() => rfSetNodes(nodes), [nodes, rfSetNodes]);
  React.useEffect(() => rfSetEdges(edges), [edges, rfSetEdges]);

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

  const nodeTypes = useMemo(
    () => ({ ...plugins.nodeTypes, ...customNodeTypes }),
    [plugins.nodeTypes, customNodeTypes]
  );
  const edgeTypes = useMemo(
    () => ({ ...plugins.edgeTypes, ...customEdgeTypes }),
    [plugins.edgeTypes, customEdgeTypes]
  );

  return (
    <div style={{ height: 'calc(100vh - 110px)' }} onContextMenu={(e) => onContextMenu?.(e, null)}>
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
