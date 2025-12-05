import { render, screen } from '@testing-library/react';
import HUD from './HUD';

describe('HUD metrics', () => {
  test('renders FPS indicator', () => {
    render(<HUD />);
    const hud = screen.getByRole('status', { name: /performance hud/i });
    expect(hud).toBeInTheDocument();
    expect(screen.getByText(/FPS:/i)).toBeInTheDocument();
  });
});
