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

// Set test-friendly defaults for feature flags (tests can override via process.env in individual files)
process.env.REACT_APP_FEATURE_FLAGS = process.env.REACT_APP_FEATURE_FLAGS || '';
process.env.REACT_APP_EXPERIMENTS_ENABLED = process.env.REACT_APP_EXPERIMENTS_ENABLED || 'false';
