import React from 'react';

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
  /** Basic HUD showing FPS placeholder and counts */
  const fps = useFPS();
  return (
    <div className="hud" aria-live="polite">
      FPS: {fps}
    </div>
  );
}
