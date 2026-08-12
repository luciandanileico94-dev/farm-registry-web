import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import App, { type Parcel } from '../App';

const mockLoadParcels = vi.hoisted(() => vi.fn());
vi.mock('../api', () => ({ loadParcels: mockLoadParcels }));

const fixtures: Parcel[] = [{ id: 'DEMO-PARCEL-001', farmer: 'Example Farm SRL', area: 42.8, status: 'Valid', crop: 'Grâu', center: [47.02, 28.84] }];
function renderApp() { return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><App /></QueryClientProvider>); }

describe('registry dashboard', () => {
  it('shows API data and filters the visible list', async () => {
    mockLoadParcels.mockResolvedValueOnce(fixtures);
    renderApp();
    expect(await screen.findByText('Example Farm SRL')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Caută parcele'), { target: { value: 'missing' } });
    expect(screen.getByText(/Nu există rezultate/)).toBeInTheDocument();
    expect(screen.queryByText('Example Farm SRL')).not.toBeInTheDocument();
  });

  it('does not hide a REST failure and offers a retry', async () => {
    mockLoadParcels.mockRejectedValueOnce(new Error('offline'));
    renderApp();
    expect(await screen.findByRole('alert')).toHaveTextContent('GET /parcels');
    expect(screen.getByRole('button', { name: 'Încearcă din nou' })).toBeInTheDocument();
  });

  it('renders an honest empty state for an empty API response', async () => {
    mockLoadParcels.mockResolvedValueOnce([]);
    renderApp();
    await waitFor(() => expect(screen.getByText(/API-ul a răspuns fără parcele/)).toBeInTheDocument());
    expect(screen.getByText('Registrul nu are date de afișat')).toBeInTheDocument();
  });
});
