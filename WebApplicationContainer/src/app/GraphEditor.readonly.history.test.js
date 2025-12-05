import { render, screen, fireEvent } from '@testing-library/react';
import GraphEditor from './GraphEditor';

// Helper to click a toolbar button by label text content
function clickByLabel(re) {
  const btn = screen.getByRole('button', { name: re });
  fireEvent.click(btn);
  return btn;
}

describe('GraphEditor read-only enforcement and history snapshots', () => {
  test('toggle read-only updates toolbar label and disables add/delete', () => {
    render(<GraphEditor />);
    // Initially editable
    const roBtn = screen.getByRole('button', { name: /editable/i });
    expect(roBtn).toBeInTheDocument();

    // Switch to read-only
    fireEvent.click(roBtn);
    expect(screen.getByRole('button', { name: /read-only/i })).toBeInTheDocument();

    // Add/Delete disabled when read-only
    const addBtn = screen.getByRole('button', { name: /\+ node/i });
    const delBtn = screen.getByRole('button', { name: /delete/i });
    expect(addBtn).toBeDisabled();
    expect(delBtn).toBeDisabled();
  });

  test('actions push labeled entries to history (undo/redo enabled accordingly)', () => {
    render(<GraphEditor />);

    // Add node should enable undo
    clickByLabel(/\+ node/i);
    const undoBtn = screen.getByRole('button', { name: /undo/i });
    expect(undoBtn).not.toBeDisabled();

    // Redo should be disabled until an undo occurs
    const redoBtn = screen.getByRole('button', { name: /redo/i });
    expect(redoBtn).toBeDisabled();

    fireEvent.click(undoBtn);
    // After undo, redo should become enabled
    expect(redoBtn).not.toBeDisabled();
  });
});
