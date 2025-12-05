import create from 'zustand';
import { nanoid } from 'nanoid';

// Simple id generator fallback if nanoid not present in deps
function id() {
  try {
    return nanoid();
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
}

// PUBLIC_INTERFACE
export const useGraphStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selection: [],
  selectedId: null,
  readOnly: false,
  customNodeTypes: {},
  customEdgeTypes: {},

  // PUBLIC_INTERFACE
  setGraph: (data) => set({ nodes: data.nodes || [], edges: data.edges || [] }),

  // PUBLIC_INTERFACE
  setNodes: (updater) =>
    set((state) => ({
      nodes: typeof updater === 'function' ? updater(state.nodes) : updater,
    })),

  // PUBLIC_INTERFACE
  setEdges: (updater) =>
    set((state) => ({
      edges: typeof updater === 'function' ? updater(state.edges) : updater,
    })),

  // PUBLIC_INTERFACE
  setReadOnly: (ro) => set({ readOnly: !!ro }),

  // PUBLIC_INTERFACE
  setSelection: (sel) => set({ selection: sel, selectedId: sel && sel.length === 1 ? sel[0] : null }),

  // PUBLIC_INTERFACE
  setSelected: (id) => set({ selectedId: id, selection: id ? [id] : [] }),

  // PUBLIC_INTERFACE
  addNode: () =>
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id: id(),
          position: { x: 100 + state.nodes.length * 20, y: 100 },
          data: { label: `Node ${state.nodes.length + 1}` },
          type: 'default',
        },
      ],
    })),

  // PUBLIC_INTERFACE
  updateNode: (nodeId, patch) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: { ...(n.data || {}), ...(patch.label ? { label: patch.label } : {} ) },
              type: patch.type || n.type,
              props: { ...(n.props || {}), ...(patch.props || {}) },
            }
          : n
      ),
    })),

  // PUBLIC_INTERFACE
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),

  // PUBLIC_INTERFACE
  removeSelected: () =>
    set((state) => {
      const sel = new Set(state.selection);
      return {
        nodes: state.nodes.filter((n) => !sel.has(n.id)),
        edges: state.edges.filter((e) => !sel.has(e.id)),
        selection: [],
        selectedId: null,
      };
    }),

  // PUBLIC_INTERFACE
  registerNodeType: (name, component) =>
    set((state) => ({ customNodeTypes: { ...state.customNodeTypes, [name]: component } })),

  // PUBLIC_INTERFACE
  registerEdgeType: (name, component) =>
    set((state) => ({ customEdgeTypes: { ...state.customEdgeTypes, [name]: component } })),
}));
