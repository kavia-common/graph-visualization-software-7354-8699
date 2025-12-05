//
// Manual Jest mock for createWorker module
// Ensures tests never attempt to resolve import.meta URLs and provides a stub worker.
//
export function createModuleWorker() {
  // Minimal stub with the same surface as the real worker object
  const worker = {
    postMessage() {},
    terminate() {},
    onmessage: null,
  };
  // Provide then-able no-op so accidental awaiting doesn't create unhandled rejections
  // eslint-disable-next-line func-names
  worker.then = function (resolve) { try { resolve && resolve(worker); } catch (_) {} return worker; };
  // Also provide catch/finally no-ops for extra safety in jest environments
  // eslint-disable-next-line func-names
  worker.catch = function () { return worker; };
  // eslint-disable-next-line func-names
  worker.finally = function (cb) { try { cb && cb(); } catch (_) {} return worker; };
  return worker;
}
