import type { ActivityRecord, Farm, FarmTask, Observation, Parcel, WorkspaceData } from './types';

const polygon = (longitude: number, latitude: number, width: number, height: number) => ({
  type: 'Polygon' as const,
  coordinates: [[[longitude, latitude], [longitude + width, latitude], [longitude + width, latitude + height], [longitude, latitude + height], [longitude, latitude]]],
});

const field = (id: string, farmId: string, farmName: string, farmer: string, fieldName: string, area: number, status: Parcel['status'], crop: string, center: [number, number], season: string, plantingDate: string, harvestWindow: string): Parcel => ({
  id, farmId, farmName, farmer, fieldName, area, status, crop, center, season, plantingDate, harvestWindow,
  geometry: polygon(center[1] - 0.005, center[0] - 0.004, 0.009, 0.007),
});

export const demoFarms: Farm[] = [
  { id: 'SYN-FARM-001', name: 'Ferma Valea Soarelui · Demo', county: 'Ialoveni', manager: 'Demo Fermier Exemplu', fieldIds: ['SYN-DEMO-001', 'SYN-DEMO-002'] },
  { id: 'SYN-FARM-002', name: 'Gospodăria Codrilor · Exemplu', county: 'Strășeni', manager: 'Exemplu Fermier Demo', fieldIds: ['SYN-DEMO-003', 'SYN-FIELD-004'] },
  { id: 'SYN-FARM-003', name: 'Ferma Prutului · Demo', county: 'Ungheni', manager: 'Elena Exemplu', fieldIds: ['SYN-FIELD-005', 'SYN-FIELD-006'] },
  { id: 'SYN-FARM-004', name: 'Cooperativa Răsărit · Exemplu', county: 'Cahul', manager: 'Mihai Demo', fieldIds: ['SYN-FIELD-007', 'SYN-FIELD-008'] },
  { id: 'SYN-FARM-005', name: 'Loturile de Nord · Demo', county: 'Bălți', manager: 'Irina Exemplu', fieldIds: ['SYN-FIELD-009', 'SYN-FIELD-010'] },
  { id: 'SYN-FARM-006', name: 'Ferma Livezilor · Exemplu', county: 'Orhei', manager: 'Sergiu Demo', fieldIds: ['SYN-FIELD-011', 'SYN-FIELD-012'] },
];

export const demoParcels: Parcel[] = [
  field('SYN-DEMO-001', 'SYN-FARM-001', 'Ferma Valea Soarelui · Demo', 'Demo Fermier Exemplu', 'Tarlaua Sud', 42.8, 'Valid', 'Grâu', [47.02, 28.84], '2025–2026', '2025-10-12', 'Iunie 2026'),
  field('SYN-DEMO-002', 'SYN-FARM-001', 'Ferma Valea Soarelui · Demo', 'Exemplu Fermier Demo', 'Tarlaua Livezii', 18.3, 'Review', 'Porumb', [47.04, 28.88], '2025–2026', '2026-04-20', 'Septembrie 2026'),
  field('SYN-DEMO-003', 'SYN-FARM-002', 'Gospodăria Codrilor · Exemplu', 'Demo Exploatație Exemplu', 'Dealul Mare', 64.1, 'Valid', 'Floarea-soarelui', [46.98, 28.92], '2025–2026', '2026-04-05', 'August 2026'),
  field('SYN-FIELD-004', 'SYN-FARM-002', 'Gospodăria Codrilor · Exemplu', 'Victor Demo', 'Izvorul Rece', 27.6, 'Blocked', 'Rapiță', [47.08, 28.76], '2025–2026', '2025-09-25', 'Iulie 2026'),
  field('SYN-FIELD-005', 'SYN-FARM-003', 'Ferma Prutului · Demo', 'Elena Exemplu', 'Lunca 1', 35.2, 'Valid', 'Soia', [47.21, 27.81], '2025–2026', '2026-05-02', 'Septembrie 2026'),
  field('SYN-FIELD-006', 'SYN-FARM-003', 'Ferma Prutului · Demo', 'Elena Exemplu', 'Lunca 2', 51.9, 'Review', 'Grâu', [47.19, 27.86], '2025–2026', '2025-10-18', 'Iunie 2026'),
  field('SYN-FIELD-007', 'SYN-FARM-004', 'Cooperativa Răsărit · Exemplu', 'Mihai Demo', 'Câmpul Nou', 73.4, 'Valid', 'Porumb', [45.91, 28.19], '2025–2026', '2026-04-25', 'Septembrie 2026'),
  field('SYN-FIELD-008', 'SYN-FARM-004', 'Cooperativa Răsărit · Exemplu', 'Mihai Demo', 'Valea Mică', 22.7, 'Blocked', 'Leguminoase', [45.95, 28.16], '2025–2026', '2026-04-29', 'August 2026'),
  field('SYN-FIELD-009', 'SYN-FARM-005', 'Loturile de Nord · Demo', 'Irina Exemplu', 'Colina 3', 46.5, 'Review', 'Orz', [47.77, 27.92], '2025–2026', '2025-10-01', 'Iunie 2026'),
  field('SYN-FIELD-010', 'SYN-FARM-005', 'Loturile de Nord · Demo', 'Irina Exemplu', 'Colina 4', 31.8, 'Valid', 'Floarea-soarelui', [47.74, 27.95], '2025–2026', '2026-04-08', 'August 2026'),
  field('SYN-FIELD-011', 'SYN-FARM-006', 'Ferma Livezilor · Exemplu', 'Sergiu Demo', 'Podișul Vechi', 14.9, 'Valid', 'Mere', [47.38, 28.82], '2025–2026', '2025-11-08', 'Octombrie 2026'),
  field('SYN-FIELD-012', 'SYN-FARM-006', 'Ferma Livezilor · Exemplu', 'Sergiu Demo', 'Podișul Nou', 39.7, 'Review', 'Grâu', [47.42, 28.79], '2025–2026', '2025-10-21', 'Iunie 2026'),
];

export const demoTasks: FarmTask[] = [
  { id: 'SYN-TASK-001', fieldId: 'SYN-DEMO-002', title: 'Verifică documentele de semănat', dueDate: '2026-05-18', priority: 'High', status: 'Open', assignee: 'Echipa Demo', createdAt: '2026-05-08' },
  { id: 'SYN-TASK-002', fieldId: 'SYN-FIELD-004', title: 'Reia măsurarea conturului', dueDate: '2026-05-16', priority: 'High', status: 'InProgress', assignee: 'Victor Demo', createdAt: '2026-05-06' },
  { id: 'SYN-TASK-003', fieldId: 'SYN-FIELD-006', title: 'Confirmă cultura declarată', dueDate: '2026-05-20', priority: 'Medium', status: 'Open', assignee: 'Elena Exemplu', createdAt: '2026-05-09' },
  { id: 'SYN-TASK-004', fieldId: 'SYN-FIELD-008', title: 'Adaugă fotografie de teren', dueDate: '2026-05-14', priority: 'Medium', status: 'Open', assignee: 'Mihai Demo', createdAt: '2026-05-07' },
  { id: 'SYN-TASK-005', fieldId: 'SYN-FIELD-009', title: 'Verifică suprafața eligibilă', dueDate: '2026-05-22', priority: 'Low', status: 'Completed', assignee: 'Irina Exemplu', createdAt: '2026-05-01' },
  { id: 'SYN-TASK-006', fieldId: 'SYN-FIELD-012', title: 'Planifică vizita de validare', dueDate: '2026-05-19', priority: 'High', status: 'Open', assignee: 'Echipa Demo', createdAt: '2026-05-10' },
  { id: 'SYN-TASK-007', fieldId: 'SYN-DEMO-001', title: 'Arhivează nota de recoltă', dueDate: '2026-05-12', priority: 'Low', status: 'Completed', assignee: 'Ana Exemplu', createdAt: '2026-04-28' },
  { id: 'SYN-TASK-008', fieldId: 'SYN-DEMO-003', title: 'Actualizează calendarul culturii', dueDate: '2026-05-21', priority: 'Low', status: 'Completed', assignee: 'Victor Demo', createdAt: '2026-05-03' },
];

export const demoObservations: Observation[] = [
  { id: 'SYN-OBS-001', fieldId: 'SYN-DEMO-002', note: 'Diferență mică între cultura declarată și fotografia de control.', category: 'Cultură', status: 'Pending', author: 'Inspector Demo', observedAt: '2026-05-10' },
  { id: 'SYN-OBS-002', fieldId: 'SYN-FIELD-004', note: 'Conturul din sursa sintetică intersectează zona de protecție.', category: 'Infrastructură', status: 'NeedsReview', author: 'Inspector Exemplu', observedAt: '2026-05-09' },
  { id: 'SYN-OBS-003', fieldId: 'SYN-FIELD-006', note: 'Răsărire uniformă pe partea de est a lotului.', category: 'Cultură', status: 'Approved', author: 'Elena Exemplu', observedAt: '2026-05-08' },
  { id: 'SYN-OBS-004', fieldId: 'SYN-FIELD-008', note: 'Canalul de irigare necesită o nouă verificare.', category: 'Irigare', status: 'Pending', author: 'Mihai Demo', observedAt: '2026-05-06' },
  { id: 'SYN-OBS-005', fieldId: 'SYN-FIELD-012', note: 'Semnalare preventivă pentru buruieni pe marginea nordică.', category: 'Dăunători', status: 'Approved', author: 'Inspector Demo', observedAt: '2026-05-05' },
];

export const demoActivity: ActivityRecord[] = [
  { id: 'SYN-AUDIT-001', fieldId: 'SYN-DEMO-002', action: 'Observație adăugată', actor: 'Inspector Demo', at: '2026-05-10 09:40', detail: 'Cultură · în așteptare' },
  { id: 'SYN-AUDIT-002', fieldId: 'SYN-DEMO-002', action: 'Câmp selectat pentru verificare', actor: 'Ana Exemplu', at: '2026-05-09 14:20', detail: 'Status Review' },
  { id: 'SYN-AUDIT-003', fieldId: 'SYN-FIELD-004', action: 'Sarcină pornită', actor: 'Victor Demo', at: '2026-05-09 11:15', detail: 'Reia măsurarea conturului' },
  { id: 'SYN-AUDIT-004', fieldId: 'SYN-FIELD-006', action: 'Observație aprobată', actor: 'Inspector Exemplu', at: '2026-05-08 16:05', detail: 'Răsărire uniformă' },
  { id: 'SYN-AUDIT-005', fieldId: 'SYN-FIELD-008', action: 'Status schimbat', actor: 'Mihai Demo', at: '2026-05-07 10:30', detail: 'Review → Blocked' },
  { id: 'SYN-AUDIT-006', fieldId: 'SYN-FIELD-009', action: 'Sarcină finalizată', actor: 'Irina Exemplu', at: '2026-05-06 13:10', detail: 'Verifică suprafața eligibilă' },
  { id: 'SYN-AUDIT-007', fieldId: 'SYN-DEMO-001', action: 'Sarcină finalizată', actor: 'Ana Exemplu', at: '2026-05-04 15:00', detail: 'Arhivează nota de recoltă' },
  { id: 'SYN-AUDIT-008', fieldId: 'SYN-FIELD-012', action: 'Câmp înregistrat', actor: 'Sistem Demo', at: '2026-05-01 08:00', detail: 'Sursă statică sintetică' },
];

export const demoWorkspace: WorkspaceData = { farms: demoFarms, fields: demoParcels, tasks: demoTasks, observations: demoObservations, activity: demoActivity };

export const cloneDemoWorkspace = (): WorkspaceData => JSON.parse(JSON.stringify(demoWorkspace)) as WorkspaceData;
