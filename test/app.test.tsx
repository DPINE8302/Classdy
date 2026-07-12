import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Onboarding } from '../components/Onboarding';

describe('application smoke', () => {
  it('renders the first meaningful Classdy screen', () => {
    render(<Onboarding onComplete={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Build your first term' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create my dashboard' })).toBeEnabled();
  });
});
