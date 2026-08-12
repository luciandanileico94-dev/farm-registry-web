import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App, { demoParcels, fieldToGeoJSON, geoJsonLayerKey, parcelBounds, toFeatureCollection } from '../App';
import { loadParcels } from '../api';

vi.mock('../api', () => ({ loadParcels: vi.fn() }));
const mockedLoadParcels = vi.mocked(loadParcels);
const renderApp = (mode: 'demo' | 'api') => render(<QueryClientProvider client={new QueryClient()}><App mode={mode} /></QueryClientProvider>);

beforeEach(() => {
  mockedLoadParcels.mockReset();
  window.localStorage.clear();
});

describe('registry dashboard', () => {
  it('ships deterministic synthetic coverage and valid closed Polygon geometry', () => {
    expect(demoParcels).toHaveLength(12);
    expect(new Set(demoParcels.map(parcel => parcel.farmId)).size).toBe(6);
    expect(demoParcels.every(parcel => parcel.id.startsWith('SYN-'))).toBe(true);
    expect(demoParcels.every(parcel => parcel.geometry.type === 'Polygon')).toBe(true);
    expect(demoParcels.every(parcel => JSON.stringify(parcel.geometry.coordinates[0][0]) === JSON.stringify(parcel.geometry.coordinates[0][parcel.geometry.coordinates[0].length - 1]))).toBe(true);
  });

  it('recreates the GeoJSON layer when async parcel geometry arrives', () => {
    expect(geoJsonLayerKey([])).not.toBe(geoJsonLayerKey(demoParcels));
    expect(toFeatureCollection(demoParcels).features).toHaveLength(12);
    expect(fieldToGeoJSON(demoParcels[0]).geometry).toEqual(demoParcels[0].geometry);
  });

  it('computes valid map bounds for empty, single and multiple polygon lists', () => {
    expect(parcelBounds([])).toBeUndefined();
    expect(parcelBounds([{ geometry: { type: 'Polygon', coordinates: [[[Number.NaN, Number.NaN]]] } }])).toBeUndefined();
    expect(parcelBounds([{ geometry: { type: 'Polygon', coordinates: [[[28, 47], [29, 48], [28, 47]]] } }])).toEqual([[47, 28], [48, 29]]);
    expect(parcelBounds([
      { geometry: { type: 'Polygon', coordinates: [[[28, 47], [29, 48], [28, 47]]] } },
      { geometry: { type: 'Polygon', coordinates: [[[27, 46], [30, 49], [27, 46]]] } },
    ])).toEqual([[46, 27], [49, 30]]);
  });

  it('renders explicit static demo data and its real geometry contract', async () => {
    renderApp('demo');
    expect(screen.getByText('Registrul Fermierului')).toBeInTheDocument();
    expect(await screen.findByText('Demo Fermier Exemplu')).toBeInTheDocument();
    expect(screen.getByText(/SYN-DEMO-001: 4 points/)).toBeInTheDocument();
    expect(screen.getByText('GeoJSON Polygon')).toBeInTheDocument();
    expect(screen.getByText('Date sintetice · scenariu local')).toBeInTheDocument();
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

  it('combines crop and status filters', async () => {
    renderApp('demo');
    await screen.findByText('Demo Fermier Exemplu');
    fireEvent.change(screen.getByLabelText('Filtru cultură'), { target: { value: 'Grâu' } });
    fireEvent.change(screen.getByLabelText('Filtru status'), { target: { value: 'Review' } });
    const registry = screen.getByLabelText('Parcel registry');
    expect(within(registry).getByText('SYN-FIELD-006')).toBeInTheDocument();
    expect(within(registry).queryByText('SYN-DEMO-001')).not.toBeInTheDocument();
  });

  it('creates a synthetic task and marks it complete', async () => {
    renderApp('demo');
    await screen.findByText('Demo Fermier Exemplu');
    fireEvent.click(screen.getByRole('button', { name: /SYN-DEMO-002/ }));
    fireEvent.click(screen.getByRole('tab', { name: /Sarcini/ }));
    expect(screen.getByText('Verifică documentele de semănat')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Marchează finalizată' }));
    expect(await screen.findByText('Sarcina a fost marcată ca finalizată.')).toBeInTheDocument();
    expect(screen.getByText('Finalizată')).toBeInTheDocument();
  });

  it('adds and approves an observation', async () => {
    renderApp('demo');
    await screen.findByText('Demo Fermier Exemplu');
    fireEvent.click(screen.getByRole('tab', { name: /Observații/ }));
    fireEvent.change(screen.getByLabelText('Notă observație'), { target: { value: 'Control sintetic completat.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adaugă observație' }));
    expect(await screen.findByText('Control sintetic completat.')).toBeInTheDocument();
    const row = screen.getByText('Control sintetic completat.').closest('.observation-row');
    expect(row).not.toBeNull();
    fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Aprobă' }));
    expect(await screen.findByText('Observație aprobată.')).toBeInTheDocument();
  });

  it('uses API parcels and displays API geometry instead of fixtures', async () => {
    mockedLoadParcels.mockResolvedValueOnce([{ ...demoParcels[0], id: 'API-001', farmer: 'API Office Farm' }]);
    renderApp('api');
    expect(await screen.findByText('API Office Farm')).toBeInTheDocument();
    expect(screen.getByText('API-001: 4 points')).toBeInTheDocument();
    expect(screen.queryByText('Demo Fermier Exemplu')).not.toBeInTheDocument();
  });

  it('shows the API loading state without fixtures', async () => {
    mockedLoadParcels.mockReturnValueOnce(new Promise(() => undefined));
    renderApp('api');
    expect(await screen.findByText('Se încarcă registrul…')).toBeInTheDocument();
    expect(screen.queryByText('Demo Fermier Exemplu')).not.toBeInTheDocument();
  });

  it('shows an explicit API empty state', async () => {
    mockedLoadParcels.mockResolvedValueOnce([]);
    renderApp('api');
    expect(await screen.findByText('Răspunsul API nu conține câmpuri. Nu au fost încărcate date demo.')).toBeInTheDocument();
    expect(screen.getByText('Nicio parcelă găsită.')).toBeInTheDocument();
  });

  it('keeps API errors separate and never falls back to demo data', async () => {
    mockedLoadParcels.mockRejectedValueOnce(new Error('offline'));
    renderApp('api');
    expect(await screen.findByRole('alert')).toHaveTextContent('Nu sunt afișate date demo în modul API.');
    await waitFor(() => expect(screen.queryByText('Demo Fermier Exemplu')).not.toBeInTheDocument());
    expect(screen.getByText('Nicio parcelă găsită.')).toBeInTheDocument();
  });

  it('exports the selected field as a GeoJSON blob', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:synthetic');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    renderApp('demo');
    await screen.findByText('Demo Fermier Exemplu');
    fireEvent.click(screen.getByRole('button', { name: /Exportă GeoJSON/ }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:synthetic'));
    delete (URL as unknown as { createObjectURL?: unknown }).createObjectURL;
    delete (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;
    click.mockRestore();
  });
});
