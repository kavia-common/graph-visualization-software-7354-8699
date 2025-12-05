import React from 'react';
import SidebarPalette from '../components/SidebarPalette';
import GraphCanvas from '../graph/GraphCanvas';
import RightPropertiesPanel from '../components/RightPropertiesPanel';
import Toasts from '../components/Toasts';

// PUBLIC_INTERFACE
export default function EditorShell() {
  /**
   * EditorShell composes the left palette, center canvas, and right properties panel.
   * It is designed to host the existing ReactFlow-based GraphCanvas.
   */
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gridTemplateRows: '1fr', height: 'calc(100vh - 110px)', width: '100vw' }}>
      <SidebarPalette />
      <GraphCanvas />
      <RightPropertiesPanel />
      <Toasts />
    </div>
  );
}
