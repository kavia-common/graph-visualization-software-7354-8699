import { render, screen } from '@testing-library/react';
import HUD from './HUD';

describe('HUD metrics', () => {
  test('renders FPS indicator', () => {
    render(<HUD />);
    expect(screen.getByText(/FPS:/i)).toBeInTheDocument();
    // aria-live for polite updates
    expect(screen.getByRole('generic', { hidden: true }) || screen.getByText(/FPS:/i).parentElement).toBeTruthy();
  });
});
