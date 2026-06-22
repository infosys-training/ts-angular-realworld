import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListErrors } from './ListErrors';

describe('ListErrors', () => {
  it('renders nothing when errors is null', () => {
    const { container } = render(<ListErrors errors={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when errors object is empty', () => {
    const { container } = render(<ListErrors errors={{ errors: {} }} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders error messages', () => {
    render(<ListErrors errors={{ errors: { email: 'is invalid', password: 'is too short' } }} />);
    expect(screen.getByText('email is invalid')).toBeInTheDocument();
    expect(screen.getByText('password is too short')).toBeInTheDocument();
  });
});
