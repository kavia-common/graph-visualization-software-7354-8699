import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders toolbar and toggles read-only', () => {
  render(<App />);
  const toggle = screen.getByRole('button', { name: /read-only|editable/i });
  expect(toggle).toBeInTheDocument();
  fireEvent.click(toggle);
  expect(toggle.textContent.toLowerCase()).toContain('read-only');
});

test('can open shortcuts overlay', () => {
  render(<App />);
  const btn = screen.getByRole('button', { name: /shortcuts/i });
  btn.click();
  expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
});
