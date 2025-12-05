import ContextMenu from './ContextMenu';
import React from 'react';

export default {
  title: 'Components/ContextMenu',
  component: ContextMenu,
};

export const Default = () => (
  <div style={{ position: 'relative', height: 200 }}>
    <ContextMenu x={40} y={40}>
      <button className="secondary">Action</button>
    </ContextMenu>
  </div>
);
