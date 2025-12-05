import create from 'zustand';

// PUBLIC_INTERFACE
export const useHistory = create((set, get) => ({
  stack: [],
  index: -1,
  // PUBLIC_INTERFACE
  push: (label) =>
    set((state) => {
      const entry = { label, ts: Date.now() };
      const stack = state.stack.slice(0, state.index + 1).concat(entry);
      return { stack, index: stack.length - 1 };
    }),
  // PUBLIC_INTERFACE
  undo: () =>
    set((state) => ({ index: Math.max(-1, state.index - 1) })),
  // PUBLIC_INTERFACE
  redo: () =>
    set((state) => ({ index: Math.min(state.stack.length - 1, state.index + 1) })),
  // PUBLIC_INTERFACE
  canUndo: () => get().index >= 0,
  // PUBLIC_INTERFACE
  canRedo: () => get().index < get().stack.length - 1,
}));
