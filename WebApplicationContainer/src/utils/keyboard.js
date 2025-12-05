const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// PUBLIC_INTERFACE
export function isUndoEvent(e) {
  return (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
}

// PUBLIC_INTERFACE
export function isRedoEvent(e) {
  const key = e.key.toLowerCase();
  return (isMac ? (e.shiftKey && e.metaKey && key === 'z') : (e.ctrlKey && key === 'y'));
}
