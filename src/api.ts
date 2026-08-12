import axios from 'axios';
import type { Parcel } from './App';
import { DEMO_PARCELS } from './demo-data';

export type DataMode = 'api' | 'demo';
export const DATA_MODE: DataMode = import.meta.env.VITE_DATA_MODE === 'demo' ? 'demo' : 'api';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000',
  timeout: 5000,
});

/** REST boundary for the registry. Errors are intentionally propagated to the UI. */
export async function loadParcels(): Promise<Parcel[]> {
  if (DATA_MODE === 'demo') {
    return DEMO_PARCELS.map((parcel) => ({ ...parcel, center: [...parcel.center] as [number, number] }));
  }

  const response = await client.get<Parcel[]>('/parcels');
  if (!Array.isArray(response.data)) {
    throw new Error('Răspunsul API nu conține o listă de parcele.');
  }
  return response.data;
}
