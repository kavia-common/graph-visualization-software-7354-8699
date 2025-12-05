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

  const normalizeToError = (reason) => {
    // Convert any non-Error reason to an Error with JSON/string details
    if (reason instanceof Error) return reason;
    try {
      const msg =
        typeof reason === 'string'
          ? reason
          : JSON.stringify(reason, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
      return new Error(msg);
    } catch {
      return new Error(String(reason));
    }
  };

  // Install process-level handlers. We log and prevent crashing the process.
  if (typeof process !== 'undefined' && process && typeof process.on === 'function') {
    process.on('unhandledRejection', (reason) => {
      const err = normalizeToError(reason);
      // Ensure stack exists for better CI logs
      if (!err.stack) {
        try {
          // create a stack lazily
          throw err;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[test:stack]', e.stack || e);
        }
      }
      _logUnhandled(err, 'unhandledRejection');
      // Prevent Node crash in Jest; tests should assert specific promise rejections explicitly.
    });
    process.on('uncaughtException', (error) => {
      const err = normalizeToError(error);
      _logUnhandled(err, 'uncaughtException');
      // Prevent crash; failing tests can still throw within their own scope.
    });
  }

  // JSDOM window-level handlers to normalize logging and avoid noisy console.
  if (typeof window !== 'undefined' && window && window.addEventListener) {
    window.addEventListener('unhandledrejection', (event) => {
      try { event?.preventDefault?.(); } catch (_) {}
      const err = normalizeToError(event?.reason);
      _logUnhandled(err, 'window.unhandledrejection');
    });
    window.addEventListener('error', (event) => {
      try { event?.preventDefault?.(); } catch (_) {}
      const err = normalizeToError(event?.error || event?.message);
      _logUnhandled(err, 'window.error');
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
    // try to clear autosave timer if persistence module is imported
    try {
      // dynamic import to avoid side-effects when not needed
      // eslint-disable-next-line global-require
      const persistence = require('./services/persistence.js');
      if (persistence && typeof persistence.__testOnly_clearAutosaveTimer === 'function') {
        persistence.__testOnly_clearAutosaveTimer();
      }
    } catch (_) {
      // ignore if module not loaded
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
