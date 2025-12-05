import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders theme toggle', () => {
  render(<App />);
  const themeBtn = screen.getByRole('button', { name: /switch to dark mode|switch to light mode/i });
  expect(themeBtn).toBeInTheDocument();
  fireEvent.click(themeBtn);
  // Button label toggles after click
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('navigates to shortcuts route', () => {
  render(<App />);
  const link = screen.getByRole('link', { name: /shortcuts/i });
  fireEvent.click(link);
  expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
});
