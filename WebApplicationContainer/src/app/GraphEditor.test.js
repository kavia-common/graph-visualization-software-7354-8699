import { render, screen } from '@testing-library/react';
import GraphEditor from './GraphEditor';

test('renders toolbar buttons', () => {
  render(<GraphEditor />);
  expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
});
