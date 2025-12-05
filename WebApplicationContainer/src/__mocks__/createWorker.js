//
// Manual Jest mock for createWorker module
// Ensures tests never attempt to resolve import.meta URLs and provides a stub worker.
//
export function createModuleWorker() {
  // Minimal stub with the same surface as the real worker object
  return {
    postMessage() {},
    terminate() {},
    onmessage: null,
  };
}
