//
// PUBLIC_INTERFACE
export function createModuleWorker(path) {
  /**
   * Create a module-type Web Worker using a path relative to this file.
   * This helper ensures that:
   * - In NODE_ENV === 'test' (Jest), we do NOT touch import.meta at import or call sites.
   * - In browsers, we use new URL(path, import.meta.url) to resolve worker script URLs.
   *
   * Usage:
   *   const worker = createModuleWorker('../workers/layout.worker.js');
   *   worker.postMessage(...); worker.onmessage = ...
   *
   * NOTE: In test environments, a Jest manual mock provides a stub implementation.
   */
  const isTest =
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.NODE_ENV === 'test' || process.env.REACT_APP_NODE_ENV === 'test')) ||
    false;

  // Never reference import.meta in tests to avoid Jest parsing issues.
  if (isTest) {
    // In tests, return a no-op mock worker. The manual mock can override this.
    return {
      postMessage() {},
      terminate() {},
      onmessage: null,
    };
  }

  // Runtime guard for environments lacking Worker or URL.
  const canUseWorker = typeof Worker !== 'undefined' && typeof URL !== 'undefined';
  if (!canUseWorker) {
    return {
      postMessage() {},
      terminate() {},
      onmessage: null,
    };
  }

  try {
    // Only evaluated in non-test builds/runtime
    // eslint-disable-next-line no-undef
    const url = new URL(path, import.meta.url);
    // eslint-disable-next-line no-undef
    return new Worker(url, { type: 'module' });
  } catch {
    // Fallback to a no-op worker in case of unexpected runtime errors.
    return {
      postMessage() {},
      terminate() {},
      onmessage: null,
    };
  }
}
