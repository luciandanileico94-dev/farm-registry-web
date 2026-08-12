import type { Parcel } from './App';

/** Public showcase data: deliberately synthetic, stable, and not a government dataset. */
export const DEMO_PARCELS: Parcel[] = [
  { id: 'DEMO-PARCEL-001', farmer: 'Ferma Exemplu SRL', area: 42.8, status: 'Valid', crop: 'Grâu', center: [47.02, 28.84] },
  { id: 'DEMO-PARCEL-002', farmer: 'Gospodăria Model', area: 18.4, status: 'Review', crop: 'Porumb', center: [47.04, 28.89] },
  { id: 'DEMO-PARCEL-003', farmer: 'Lot Sintetic Nord', area: 67.1, status: 'Blocked', crop: 'Floarea-soarelui', center: [47.00, 28.92] },
];
