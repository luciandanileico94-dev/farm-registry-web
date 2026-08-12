import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App, { demoParcels, geoJsonLayerKey } from '../App';
import { loadParcels } from '../api';

vi.mock('../api', () => ({ loadParcels: vi.fn() }));
const mockedLoadParcels = vi.mocked(loadParcels);
const renderApp = (mode: 'demo' | 'api') => render(<QueryClientProvider client={new QueryClient()}><App mode={mode} /></QueryClientProvider>);

describe('registry dashboard', () => {
  it('recreates the GeoJSON layer when async parcel geometry arrives', () => {
    expect(geoJsonLayerKey([])).not.toBe(geoJsonLayerKey(demoParcels));
  });

  it('renders explicit static demo data and its real geometry contract', async () => {
    renderApp('demo');
    expect(screen.getByText('Registrul Fermierului')).toBeInTheDocument();
    expect(await screen.findByText('Demo Fermier Exemplu')).toBeInTheDocument();
    expect(screen.getByText(/SYN-DEMO-001: 4 points/)).toBeInTheDocument();
    expect(screen.getByText('GeoJSON Polygon')).toBeInTheDocument();
  });

  it('filters the registry and updates the selected parcel', async () => {
    renderApp('demo');
    expect((await screen.findAllByText('SYN-DEMO-001')).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Search parcels'), { target: { value: 'porumb' } });
    const registry = screen.getByLabelText('Parcel registry');
    expect(within(registry).queryByText('SYN-DEMO-001')).not.toBeInTheDocument();
    expect(within(registry).getByText('SYN-DEMO-002')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /SYN-DEMO-002/ }));
    expect(screen.getByRole('heading', { name: 'Exemplu Fermier Demo' })).toBeInTheDocument();
    expect(screen.getByText('Necesită verificare')).toBeInTheDocument();
  });

  it('uses API parcels and displays API geometry instead of fixtures', async () => {
    mockedLoadParcels.mockResolvedValueOnce([{ ...demoParcels[0], id: 'API-001', farmer: 'API Office Farm' }]);
    renderApp('api');
    expect(await screen.findByText('API Office Farm')).toBeInTheDocument();
    expect(screen.getByText('API-001: 4 points')).toBeInTheDocument();
    expect(screen.queryByText('Demo Fermier Exemplu')).not.toBeInTheDocument();
  });

  it('keeps API errors separate and never falls back to demo data', async () => {
    mockedLoadParcels.mockRejectedValueOnce(new Error('offline'));
    renderApp('api');
    expect(await screen.findByRole('alert')).toHaveTextContent('Nu sunt afișate date demo în modul API.');
    await waitFor(() => expect(screen.queryByText('Demo Fermier Exemplu')).not.toBeInTheDocument());
    expect(screen.getByText('Nicio parcelă găsită.')).toBeInTheDocument();
  });
});
