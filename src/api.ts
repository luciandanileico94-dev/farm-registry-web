import axios from 'axios';
import type { Parcel } from './App';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000',
  timeout: 1800,
});

/** The API boundary deliberately propagates failures: API mode must never become demo mode silently. */
export async function loadParcels(): Promise<Parcel[]> {
  const response = await client.get<Parcel[]>('/parcels');
  return response.data;
}
