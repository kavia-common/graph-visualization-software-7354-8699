import React from 'react';
import { getCounters, featureEnabled } from '../perf/metrics';

function useFPS() {
  const [fps, setFps] = React.useState(0);
  React.useEffect(() => {
    let frames = 0;
    let rafId;
    const timer = setInterval(() => {
      setFps(frames);
      frames = 0;
    }, 1000);
    const loop = () => {
      frames++;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(timer);
    };
  }, []);
  return fps;
}

// PUBLIC_INTERFACE
export default function HUD() {
  /** Basic HUD showing FPS and optional perf counters */
  const fps = useFPS();
  const [counters, setCounters] = React.useState({});
  React.useEffect(() => {
    if (!featureEnabled('perf-counters')) return;
    const id = setInterval(() => setCounters(getCounters()), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hud" aria-live="polite" role="status" aria-label="Performance HUD">
      <div>FPS: {fps}</div>
      {featureEnabled('perf-counters') && (
        <div style={{ marginTop: 4 }}>
          {Object.entries(counters).map(([k, v]) => (
            <span key={k} style={{ marginRight: 8 }}>
              {k}: {String(v)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
