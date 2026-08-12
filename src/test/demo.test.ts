import { describe, expect, it, vi } from 'vitest';

const mockGet = vi.hoisted(() => vi.fn());
vi.mock('axios', () => ({ default: { create: () => ({ get: mockGet }) } }));

import { DATA_MODE, loadParcels } from '../api';

describe('explicit static demo adapter', () => {
  it.skipIf(DATA_MODE !== 'demo')('uses bundled synthetic fixtures without contacting the API', async () => {
    expect(DATA_MODE).toBe('demo');
    const parcels = await loadParcels();

    expect(parcels.length).toBeGreaterThan(0);
    expect(parcels.every((parcel) => parcel.id.startsWith('DEMO-'))).toBe(true);
    expect(mockGet).not.toHaveBeenCalled();
  });
});
