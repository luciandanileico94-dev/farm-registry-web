import axios from 'axios';
import type { Parcel } from './App';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000', timeout: 1200 });

/** Typed REST boundary. The demo falls back to local fixtures when the API is not running. */
export async function loadParcels(): Promise<Parcel[]> {
  if (import.meta.env.MODE === 'test') return [];
  try {
    const response = await client.get<Parcel[]>('/parcels');
    return response.data;
  } catch {
    return [];
  }
}
