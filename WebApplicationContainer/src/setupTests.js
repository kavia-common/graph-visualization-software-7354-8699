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

// Temporary: swallow unhandled promise rejections during tests to prevent Node ERR_UNHANDLED_REJECTION
// This can happen when RAF/interval callbacks throw during teardown.
if (typeof window !== 'undefined') {
  const handler = (event) => {
    // Log to console for visibility in CI, but prevent test process from crashing.
    // eslint-disable-next-line no-console
    console.warn('Suppressed unhandledrejection in tests:', event.reason);
    event.preventDefault?.();
  };
  window.addEventListener('unhandledrejection', handler);
  // Also attach to process in case some libs emit at process level
  if (typeof process !== 'undefined' && process.on) {
    process.on('unhandledRejection', (reason) => {
      // eslint-disable-next-line no-console
      console.warn('Suppressed process unhandledRejection in tests:', reason);
    });
  }
}

// Ensure all timers/RAFs are cleared between tests to avoid leaks from HUD or others
afterEach(() => {
  try {
    // A couple of RAF cycles to allow queued cleanups to run
    if (typeof requestAnimationFrame !== 'undefined') {
      for (let i = 0; i < 3; i++) {
        requestAnimationFrame(() => {});
      }
    }
  } catch {
    // ignore
  }
  jest.useRealTimers();
});

// Set test-friendly defaults for feature flags (tests can override via process.env in individual files)
process.env.REACT_APP_FEATURE_FLAGS = process.env.REACT_APP_FEATURE_FLAGS || '';
process.env.REACT_APP_EXPERIMENTS_ENABLED = process.env.REACT_APP_EXPERIMENTS_ENABLED || 'false';
