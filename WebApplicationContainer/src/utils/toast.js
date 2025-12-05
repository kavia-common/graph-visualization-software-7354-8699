const listeners = new Set();

export function subscribeToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function toast(message, type = 'info', timeout = 3000) {
  const payload = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, type };
  listeners.forEach((fn) => fn(payload));
  if (timeout > 0) {
    setTimeout(() => {
      listeners.forEach((fn) => fn({ ...payload, dismiss: true }));
    }, timeout);
  }
}

// A basic React component to render toasts; optional to embed in HUD or root.
