import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LostFound from '../../features/lostfound';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: {
      _id: 'u1',
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
    },
  }),
}));

vi.mock('../../config', () => ({
  API_BASE: 'http://localhost:5000',
}));

describe('LostFound page smoke test', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ items: [], totalPages: 1 }),
        statusText: 'OK',
      }))
    );

    class MockIntersectionObserver {
      observe() {}
      disconnect() {}
      unobserve() {}
    }

    vi.stubGlobal(
      'IntersectionObserver',
      MockIntersectionObserver as unknown as typeof IntersectionObserver
    );
  });

  it('renders without crashing and shows page heading', async () => {
    render(
      <MemoryRouter>
        <LostFound />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Lost and Found')).toBeInTheDocument();
    });
  });
});
