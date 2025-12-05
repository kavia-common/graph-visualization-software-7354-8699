const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// PUBLIC_INTERFACE
export function isUndoEvent(e) {
  /** Detect platform-appropriate undo. */
  return (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
}

// PUBLIC_INTERFACE
export function isRedoEvent(e) {
  /** Detect platform-appropriate redo. */
  const key = e.key.toLowerCase();
  return (isMac ? (e.shiftKey && e.metaKey && key === 'z') : (e.ctrlKey && key === 'y'));
}

// PUBLIC_INTERFACE
export function isDeleteEvent(e) {
  /** Detect delete/backspace without modifiers. */
  return (e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !e.metaKey && !e.altKey;
}

// PUBLIC_INTERFACE
export function isAddNodeEvent(e) {
  /** N without modifiers. */
  return e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey;
}
