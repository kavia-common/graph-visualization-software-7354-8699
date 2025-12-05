const flags = (process.env.REACT_APP_FEATURE_FLAGS || '').split(',').map(f => f.trim());
const experimentsEnabled = String(process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase() === 'true';

// PUBLIC_INTERFACE
export function featureEnabled(name) {
  /** Check if a feature flag is enabled via REACT_APP_FEATURE_FLAGS CSV list. */
  return flags.includes(name);
}

// PUBLIC_INTERFACE
export function experiments() {
  /** Returns whether experiments are enabled via REACT_APP_EXPERIMENTS_ENABLED. */
  return experimentsEnabled;
}

// PUBLIC_INTERFACE
export function mark(name) {
  /** Add a performance mark if available. */
  if (!featureEnabled('perf-marks')) return;
  try {
    performance.mark(name);
  } catch {}
}

// PUBLIC_INTERFACE
export function measure(name, startMark, endMark) {
  /** Add a performance measure if available. */
  if (!featureEnabled('perf-marks')) return;
  try {
    if (endMark) performance.mark(endMark);
    performance.measure(name, startMark, endMark);
  } catch {}
}

// PUBLIC_INTERFACE
export function counter(name, inc = 1) {
  /** Increment a named counter stored in memory (for HUD/debug). */
  if (!featureEnabled('perf-counters')) return;
  window.__perfCounters = window.__perfCounters || {};
  window.__perfCounters[name] = (window.__perfCounters[name] || 0) + inc;
  return window.__perfCounters[name];
}

// PUBLIC_INTERFACE
export function getCounters() {
  /** Get snapshot of collected counters. */
  return { ...(window.__perfCounters || {}) };
}
