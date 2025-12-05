import Toolbar from './Toolbar';

const meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
};
export default meta;

export const Default = {
  args: {
    onAddNode: () => {},
    onDelete: () => {},
    onUndo: () => {},
    onRedo: () => {},
    canUndo: false,
    canRedo: false,
    onImport: () => {},
    onExport: () => {},
    readOnly: false,
    onToggleReadOnly: () => {},
    onShowShortcuts: () => {},
    busy: false,
    onBackup: () => {},
    onRestore: () => {},
  }
};
