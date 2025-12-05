import React, { useEffect, useRef } from 'react';

// PUBLIC_INTERFACE
export default function ContextMenu({ x, y, onClose, children }) {
  /** Simple context menu that closes on blur or escape. */
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose]);

  return (
    <div className="context-menu" ref={ref} style={{ left: x, top: y }}>
      {children}
    </div>
  );
}
