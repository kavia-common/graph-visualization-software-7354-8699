function readFlags() {
  const csv = process.env.REACT_APP_FEATURE_FLAGS || '';
  // guard: split empty to [''] -> filter empties
  return csv.split(',').map(f => f.trim()).filter(Boolean);
}
function readExperiments() {
  return String(process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase() === 'true';
}

// PUBLIC_INTERFACE
export function featureEnabled(name) {
  /** Check if a feature flag is enabled via REACT_APP_FEATURE_FLAGS CSV list. Evaluated at call-time. */
  const flags = readFlags();
  return flags.includes(name);
}

// PUBLIC_INTERFACE
export function experiments() {
  /** Returns whether experiments are enabled via REACT_APP_EXPERIMENTS_ENABLED. Evaluated at call-time. */
  return readExperiments();
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
