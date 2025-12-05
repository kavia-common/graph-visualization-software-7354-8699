/** PUBLIC_INTERFACE
 * Minimal SDK typings for external plugins. This file is documentation only.
 */

export interface GraphNodeData {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data?: {
    label?: string;
    collapsed?: boolean;
    groupCollapsed?: boolean;
    [key: string]: any;
  };
  group?: string;
  [key: string]: any;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  [key: string]: any;
}

export type NodeRenderer = React.ComponentType<{ id?: string; data?: any }>;
export type EdgeRenderer = React.ComponentType<any>;

export interface PluginRegistry {
  nodeTypes: Record<string, NodeRenderer>;
  edgeTypes: Record<string, EdgeRenderer>;
}

// PUBLIC_INTERFACE
export function registerNodeType(name: string, component: NodeRenderer): void;

// PUBLIC_INTERFACE
export function registerEdgeType(name: string, component: EdgeRenderer): void;
