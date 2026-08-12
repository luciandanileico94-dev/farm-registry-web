import axios from 'axios';
import type { Farm, FarmTask, Observation, Parcel } from './types';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000',
  timeout: 1800,
});

/** The API boundary deliberately propagates failures: API mode must never become demo mode silently. */
export async function loadParcels(): Promise<Parcel[]> {
  const response = await client.get<Parcel[]>('/parcels');
  return response.data;
}

/** Resource boundaries mirror the Python API resources; /parcels remains the compatibility path for fields. */
export async function loadFarms(): Promise<Farm[]> {
  const response = await client.get<Farm[]>('/farms');
  return response.data;
}

export async function loadFields(): Promise<Parcel[]> {
  return loadParcels();
}

export async function loadTasks(): Promise<FarmTask[]> {
  const response = await client.get<FarmTask[]>('/tasks');
  return response.data;
}

export async function loadObservations(): Promise<Observation[]> {
  const response = await client.get<Observation[]>('/observations');
  return response.data;
}
