 /**
  * Global Jest setup for tests: stabilize async errors and clear timers between tests.
  * - Capture unhandled promise rejections and uncaught exceptions so tests fail deterministically.
  * - Ensure timers are reset after each test to avoid cross-test interference.
  * - Keep jest-dom and existing Worker mock to avoid worker import issues in tests.
  */

/* Fail fast on async errors so CI surfaces the failing test deterministically.
   Install both process and window handlers (for JSDOM) and guard to avoid double-binding. */
if (!global.__TEST_ERROR_HANDLERS__) {
  global.__TEST_ERROR_HANDLERS__ = true;
  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled Rejection during tests:', reason);
    throw (reason instanceof Error) ? reason : new Error(String(reason));
  });

  process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('Uncaught Exception during tests:', err);
    throw err;
  });

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('unhandledrejection', (event) => {
      // eslint-disable-next-line no-console
      console.error('Window unhandledrejection during tests:', event.reason);
      // Prevent default to avoid noisy logs
      event.preventDefault?.();
      throw (event.reason instanceof Error) ? event.reason : new Error(String(event.reason));
    });
    window.addEventListener('error', (event) => {
      // eslint-disable-next-line no-console
      console.error('Window error during tests:', event.error || event.message);
      event.preventDefault?.();
      if (event.error) {
        throw event.error;
      } else {
        throw new Error(String(event.message || 'Window error'));
      }
    });
  }
}

/* jest-dom adds custom jest matchers for asserting on DOM nodes.
   allows you to do things like:
   expect(element).toHaveTextContent(/react/i)
   learn more: https://github.com/testing-library/jest-dom */
import '@testing-library/jest-dom';

// Provide minimal Worker mock to prevent import.meta worker URL parsing in tests
if (typeof window !== 'undefined' && typeof window.Worker === 'undefined') {
  // eslint-disable-next-line no-unused-vars
  class MockWorker {
    constructor() {}
    // eslint-disable-next-line class-methods-use-this
    postMessage() {}
    // eslint-disable-next-line class-methods-use-this
    terminate() {}
    // attachable onmessage
  }
  // Attach to both window and global scope for consistency
  window.Worker = MockWorker;
}

// Ensure all timers/RAFs/mocks are cleared between tests to avoid leaks from HUD or others
afterEach(() => {
  try {
    // Clear pending timers for both real and fake modes
    if (typeof jest !== 'undefined' && typeof jest.clearAllTimers === 'function') {
      jest.clearAllTimers();
    }
    // Clear mocks to remove lingering timers created by mocks
    if (typeof jest !== 'undefined' && typeof jest.clearAllMocks === 'function') {
      jest.clearAllMocks();
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to clear timers/mocks in afterEach:', e);
  }
  // Always return to real timers at end of each test
  if (typeof jest !== 'undefined' && typeof jest.useRealTimers === 'function') {
    jest.useRealTimers();
  }
});

// Set test-friendly defaults for feature flags (tests can override via process.env in individual files)
process.env.REACT_APP_FEATURE_FLAGS = process.env.REACT_APP_FEATURE_FLAGS || '';
process.env.REACT_APP_EXPERIMENTS_ENABLED = process.env.REACT_APP_EXPERIMENTS_ENABLED || 'false';
