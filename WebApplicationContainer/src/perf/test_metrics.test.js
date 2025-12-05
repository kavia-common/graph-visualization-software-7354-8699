import { featureEnabled, experiments, counter, getCounters, mark, measure } from './metrics';

describe('perf metrics flags and counters', () => {
  const original = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...original, REACT_APP_FEATURE_FLAGS: 'perf-counters,perf-marks', REACT_APP_EXPERIMENTS_ENABLED: 'true' };
    // reset window counters
    delete window.__perfCounters;
  });

  afterAll(() => {
    process.env = original;
  });

  test('featureEnabled works with CSV', () => {
    expect(featureEnabled('perf-counters')).toBe(true);
    expect(featureEnabled('unknown-flag')).toBe(false);
  });

  test('experiments reads boolean', () => {
    expect(experiments()).toBe(true);
  });

  test('counter increments and HUD can read', () => {
    expect(counter('layout_runs')).toBe(1);
    expect(counter('layout_runs', 2)).toBe(3);
    expect(getCounters().layout_runs).toBe(3);
  });

  test('mark/measure do not throw', () => {
    expect(() => mark('A')).not.toThrow();
    expect(() => measure('B', 'A', 'B.end')).not.toThrow();
  });
});
