import { describe, expect, it, vi } from 'vitest';

const mockGet = vi.hoisted(() => vi.fn());
vi.mock('axios', () => ({ default: { create: () => ({ get: mockGet }) } }));

import { loadParcels } from '../api';

describe('parcels API boundary', () => {
  it('rejects a non-array API response', async () => {
    mockGet.mockResolvedValueOnce({ data: { message: 'Demo response' } });

    await expect(loadParcels()).rejects.toThrow('Răspunsul API nu conține o listă de parcele.');
  });
});
