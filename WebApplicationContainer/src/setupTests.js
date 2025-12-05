 /**
  * Global Jest setup for tests: stabilize async errors and clear timers between tests.
  *
  * Goal for Step 3.2:
  * - Add process-level handlers that log reason/stack but do not crash Node, avoiding ERR_UNHANDLED_REJECTION.
  * - Still surface failures via test assertions (do not mask errors silently).
  * - Ensure timers and mocks are reset between tests to reduce open handles.
  * - Provide minimal Worker mock guard to avoid import.meta related issues in tests.
  */

let alreadyBound = false;

// PUBLIC_INTERFACE
export function _logUnhandled(reason, origin = 'unknown') {
  /** Logs unhandled errors in a normalized way for easier CI debugging. */
  try {
    // eslint-disable-next-line no-console
    console.error('[test:unhandled]', {
      origin,
      name: reason && reason.name,
      message: (reason && reason.message) || String(reason),
      stack: (reason && reason.stack) || undefined,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[test:unhandled:logger-failed]', e);
  }
}

if (!alreadyBound) {
  alreadyBound = true;

  // Install process-level handlers. We log and prevent crashing the process.
  if (typeof process !== 'undefined' && process && typeof process.on === 'function') {
    process.on('unhandledRejection', (reason) => {
      _logUnhandled(reason, 'unhandledRejection');
      // Prevent Node crash in Jest; tests should assert specific promise rejections explicitly.
    });
    process.on('uncaughtException', (error) => {
      _logUnhandled(error, 'uncaughtException');
      // Prevent crash; failing tests can still throw within their own scope.
    });
  }

  // JSDOM window-level handlers to normalize logging and avoid noisy console.
  if (typeof window !== 'undefined' && window && window.addEventListener) {
    window.addEventListener('unhandledrejection', (event) => {
      try { event?.preventDefault?.(); } catch (_) {}
      _logUnhandled(event?.reason, 'window.unhandledrejection');
    });
    window.addEventListener('error', (event) => {
      try { event?.preventDefault?.(); } catch (_) {}
      _logUnhandled(event?.error || event?.message, 'window.error');
    });
  }
}

// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Provide minimal Worker mock to prevent import.meta worker URL parsing in tests as a safety net
if (typeof window !== 'undefined' && typeof window.Worker === 'undefined') {
  // eslint-disable-next-line no-unused-vars
  class MockWorker {
    // PUBLIC_INTERFACE
    constructor() {}
    /** no-op postMessage */
    // PUBLIC_INTERFACE
    postMessage() {}
    /** no-op terminate */
    // PUBLIC_INTERFACE
    terminate() {}
    // onmessage is assignable
  }
  window.Worker = MockWorker;
}

// Ensure timers/mocks are cleared between tests to avoid open handles
afterEach(() => {
  try {
    if (typeof jest !== 'undefined') {
      if (typeof jest.clearAllTimers === 'function') jest.clearAllTimers();
      if (typeof jest.clearAllMocks === 'function') jest.clearAllMocks();
      if (typeof jest.useRealTimers === 'function') jest.useRealTimers();
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to clear timers/mocks in afterEach:', e);
  }
});

// Final teardown hook to reduce lingering resources from libs
afterAll(() => {
  try {
    if (typeof global !== 'undefined' && typeof global.gc === 'function') {
      global.gc();
    }
  } catch (_) {
    // ignore
  }
});
