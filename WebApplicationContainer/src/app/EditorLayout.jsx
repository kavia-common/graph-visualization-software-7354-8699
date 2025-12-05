import React from 'react';
import SidebarPalette from '../components/SidebarPalette';
import GraphCanvas from '../graph/GraphCanvas';
import RightPropertiesPanel from '../components/RightPropertiesPanel';
import Toasts from '../components/Toasts';

export default function EditorLayout() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gridTemplateRows: '1fr', height: '100vh', width: '100vw' }}>
      <SidebarPalette />
      <GraphCanvas />
      <RightPropertiesPanel />
      <Toasts />
    </div>
  );
}
