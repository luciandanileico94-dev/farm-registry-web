import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { loadParcels } from './api';
import { cloneDemoWorkspace, demoWorkspace } from './fixtures';
import type { ActivityRecord, DataMode, FarmTask, Observation, ObservationStatus, Parcel, ParcelStatus, WorkspaceData } from './types';
import './styles.css';

export type { ActivityRecord, DataMode, FarmTask, Observation, ObservationStatus, Parcel, ParcelStatus, WorkspaceData } from './types';
export { demoParcels } from './fixtures';

const LOCAL_KEY = 'farm-registry-demo-workspace-v1';
const DEMO_DATE_LABEL = 'Date sintetice · scenariu local';

export const dataMode = (): DataMode => import.meta.env.VITE_FARM_REGISTRY_MODE === 'api' ? 'api' : 'demo';

const blankApiWorkspace = (): WorkspaceData => ({ farms: [], fields: [], tasks: [], observations: [], activity: [] });

function readDemoWorkspace(): WorkspaceData {
  try {
    const stored = window.localStorage.getItem(LOCAL_KEY);
    if (stored) return JSON.parse(stored) as WorkspaceData;
  } catch {
    // A private browsing context may reject localStorage. The deterministic fixture remains usable.
  }
  return cloneDemoWorkspace();
}

function statusLabel(status: ParcelStatus): string {
  return status === 'Valid' ? 'Validat' : status === 'Review' ? 'În verificare' : 'Blocat';
}

function taskStatusLabel(status: FarmTask['status']): string {
  return status === 'Completed' ? 'Finalizată' : status === 'InProgress' ? 'În lucru' : 'Deschisă';
}

function observationStatusLabel(status: ObservationStatus): string {
  return status === 'Approved' ? 'Aprobată' : status === 'NeedsReview' ? 'Necesită revizie' : 'În așteptare';
}

export function toFeatureCollection(items: Parcel[]): FeatureCollection<Geometry> {
  return {
    type: 'FeatureCollection',
    features: items.map((parcel): Feature<Geometry> => ({
      type: 'Feature',
      properties: { id: parcel.id, status: parcel.status, crop: parcel.crop, area: parcel.area },
      geometry: parcel.geometry,
    })),
  };
}

export function fieldToGeoJSON(parcel: Parcel): Feature<Geometry> {
  return { type: 'Feature', properties: { id: parcel.id, farmer: parcel.farmer, crop: parcel.crop, area: parcel.area, status: parcel.status }, geometry: parcel.geometry };
}

export function geoJsonLayerKey(items: Parcel[]): string {
  return items.map(parcel => `${parcel.id}:${JSON.stringify(parcel.geometry)}`).join('|');
}

export function parcelBounds(fields: Pick<Parcel, 'geometry'>[]): [[number, number], [number, number]] | undefined {
  let minLatitude = Infinity;
  let minLongitude = Infinity;
  let maxLatitude = -Infinity;
  let maxLongitude = -Infinity;

  for (const field of fields) {
    for (const ring of field.geometry.coordinates) {
      for (const [longitude, latitude] of ring) {
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
        minLatitude = Math.min(minLatitude, latitude);
        minLongitude = Math.min(minLongitude, longitude);
        maxLatitude = Math.max(maxLatitude, latitude);
        maxLongitude = Math.max(maxLongitude, longitude);
      }
    }
  }

  if (![minLatitude, minLongitude, maxLatitude, maxLongitude].every(Number.isFinite)) return undefined;
  return [[minLatitude, minLongitude], [maxLatitude, maxLongitude]];
}

function MapViewport({ fields, focusedId }: { fields: Parcel[]; focusedId?: string }) {
  const map = useMap();

  useEffect(() => {
    const bounds = parcelBounds(fields);
    if (bounds) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16, animate: false });
  }, [fields, map]);

  useEffect(() => {
    const focused = fields.find(field => field.id === focusedId);
    const bounds = focused ? parcelBounds([focused]) : undefined;
    if (bounds) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
  }, [fields, focusedId, map]);

  return null;
}

function MapView({ fields, selectedId, focusedId, onSelect }: { fields: Parcel[]; selectedId?: string; focusedId?: string; onSelect: (id: string) => void }) {
  if (import.meta.env.MODE === 'test') {
    return <div className="map test-map" aria-label="Parcel geometry map"><span>Leaflet geometry preview</span><small>{fields.map(field => `${field.id}: ${field.geometry.coordinates[0].length - 1} points`).join(' · ')}</small></div>;
  }

  return <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false} className="map" aria-label="Parcel geometry map">
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <MapViewport fields={fields} focusedId={focusedId} />
    <GeoJSON key={geoJsonLayerKey(fields)} data={toFeatureCollection(fields)} style={feature => ({
      color: feature?.properties?.id === selectedId ? '#d66b39' : feature?.properties?.status === 'Review' ? '#d18b25' : feature?.properties?.status === 'Blocked' ? '#b44d40' : '#168a76',
      weight: feature?.properties?.id === selectedId ? 3 : 2,
      fillOpacity: feature?.properties?.id === selectedId ? 0.24 : 0.12,
    })} eventHandlers={{ click: event => {
      const id = event.propagatedFrom?.feature?.properties?.id;
      if (id) onSelect(id);
    } }} />
  </MapContainer>;
}

function addAudit(workspace: WorkspaceData, fieldId: string, action: string, detail: string): ActivityRecord[] {
  return [{ id: `SYN-AUDIT-LOCAL-${String(workspace.activity.length + 1).padStart(3, '0')}`, fieldId, action, actor: 'Operator Demo', at: '2026-05-12 10:00', detail }, ...workspace.activity];
}

function exportField(parcel: Parcel) {
  const blob = new Blob([JSON.stringify(fieldToGeoJSON(parcel), null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${parcel.id}.geojson`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function App({ mode = dataMode() }: { mode?: DataMode }) {
  const [localWorkspace, setLocalWorkspace] = useState<WorkspaceData>(() => mode === 'demo' ? readDemoWorkspace() : blankApiWorkspace());
  const [selectedId, setSelectedId] = useState<string>();
  const [focusedMapId, setFocusedMapId] = useState<string>();
  const [query, setQuery] = useState('');
  const [farmFilter, setFarmFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'cycle' | 'tasks' | 'observations' | 'audit'>('overview');
  const [observationNote, setObservationNote] = useState('');
  const [observationCategory, setObservationCategory] = useState<Observation['category']>('Cultură');
  const [toast, setToast] = useState('');

  const { data: apiFields, isLoading, isError, isSuccess } = useQuery({ queryKey: ['fields', mode], queryFn: loadParcels, enabled: mode === 'api', retry: false });
  const fields = mode === 'demo' ? localWorkspace.fields : (apiFields ?? []);

  useEffect(() => {
    if (mode === 'demo') {
      try { window.localStorage.setItem(LOCAL_KEY, JSON.stringify(localWorkspace)); } catch { /* localStorage is optional */ }
    }
  }, [localWorkspace, mode]);

  useEffect(() => {
    if (fields.length && (!selectedId || !fields.some(field => field.id === selectedId))) setSelectedId(fields[0].id);
  }, [fields, selectedId]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const farms = useMemo(() => {
    if (mode === 'demo') return localWorkspace.farms;
    return Array.from(new Map(fields.map(field => [field.farmId ?? field.farmer, { id: field.farmId ?? field.farmer, name: field.farmName ?? field.farmer, county: 'Sursă API', manager: field.farmer, fieldIds: [] }])).values());
  }, [fields, localWorkspace.farms, mode]);
  const filteredFields = useMemo(() => fields.filter(field => {
    const haystack = `${field.id} ${field.farmer} ${field.crop} ${field.farmName ?? ''} ${field.fieldName ?? ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (farmFilter === 'all' || (field.farmId ?? field.farmer) === farmFilter) && (cropFilter === 'all' || field.crop === cropFilter) && (statusFilter === 'all' || field.status === statusFilter);
  }), [fields, query, farmFilter, cropFilter, statusFilter]);
  const selected = fields.find(field => field.id === selectedId) ?? filteredFields[0];
  const tasks = mode === 'demo' ? localWorkspace.tasks : localWorkspace.tasks.filter(task => task.fieldId === selected?.id);
  const observations = mode === 'demo' ? localWorkspace.observations : localWorkspace.observations.filter(observation => observation.fieldId === selected?.id);
  const activity = mode === 'demo' ? localWorkspace.activity : localWorkspace.activity.filter(record => record.fieldId === selected?.id);
  const selectedTasks = tasks.filter(task => task.fieldId === selected?.id);
  const selectedObservations = observations.filter(observation => observation.fieldId === selected?.id);
  const selectedActivity = activity.filter(record => record.fieldId === selected?.id);
  const cropOptions = Array.from(new Set(fields.map(field => field.crop)));
  const openTaskCount = tasks.filter(task => task.status !== 'Completed').length;
  const pendingValidation = fields.filter(field => field.status !== 'Valid').length;

  const selectField = (id: string) => { setSelectedId(id); setFocusedMapId(id); setActiveTab('overview'); };
  const updateFilter = (update: () => void) => { update(); setFocusedMapId(undefined); };
  const notify = (message: string) => setToast(message);

  const createTask = () => {
    if (!selected) return;
    const next: FarmTask = { id: `SYN-TASK-LOCAL-${String(localWorkspace.tasks.length + 1).padStart(3, '0')}`, fieldId: selected.id, title: `Verificare de teren · ${selected.fieldName ?? selected.id}`, dueDate: '2026-05-20', priority: 'Medium', status: 'Open', assignee: 'Operator Demo', createdAt: '2026-05-12' };
    setLocalWorkspace(current => ({ ...current, tasks: [next, ...current.tasks], activity: addAudit(current, selected.id, 'Sarcină creată', next.title) }));
    setActiveTab('tasks');
    notify('Sarcină sintetică creată.');
  };

  const completeTask = (taskId: string) => {
    const task = localWorkspace.tasks.find(item => item.id === taskId);
    if (!task) return;
    setLocalWorkspace(current => ({ ...current, tasks: current.tasks.map(item => item.id === taskId ? { ...item, status: 'Completed' } : item), activity: addAudit(current, task.fieldId, 'Sarcină finalizată', task.title) }));
    notify('Sarcina a fost marcată ca finalizată.');
  };

  const addObservation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !observationNote.trim()) return;
    const next: Observation = { id: `SYN-OBS-LOCAL-${String(localWorkspace.observations.length + 1).padStart(3, '0')}`, fieldId: selected.id, note: observationNote.trim(), category: observationCategory, status: 'Pending', author: 'Operator Demo', observedAt: '2026-05-12' };
    setLocalWorkspace(current => ({ ...current, observations: [next, ...current.observations], activity: addAudit(current, selected.id, 'Observație adăugată', `${next.category} · în așteptare`) }));
    setObservationNote('');
    setActiveTab('observations');
    notify('Observație adăugată pentru câmpul selectat.');
  };

  const reviewObservation = (observationId: string, status: ObservationStatus) => {
    const observation = localWorkspace.observations.find(item => item.id === observationId);
    if (!observation) return;
    setLocalWorkspace(current => ({ ...current, observations: current.observations.map(item => item.id === observationId ? { ...item, status } : item), activity: addAudit(current, observation.fieldId, status === 'Approved' ? 'Observație aprobată' : 'Observație trimisă la revizie', observation.note) }));
    notify(status === 'Approved' ? 'Observație aprobată.' : 'Observație trimisă la revizie.');
  };

  const resetDemo = () => {
    if (mode === 'demo') {
      const fresh = cloneDemoWorkspace();
      setLocalWorkspace(fresh);
      try { window.localStorage.removeItem(LOCAL_KEY); } catch { /* localStorage is optional */ }
    } else setLocalWorkspace(blankApiWorkspace());
    setSelectedId(undefined);
    setFocusedMapId(undefined);
    setFarmFilter('all'); setCropFilter('all'); setStatusFilter('all'); setQuery('');
    notify('Datele locale au fost resetate la scenariul inițial.');
  };

  return <div className="app">
    <header>
      <div className="brand"><span className="brand-mark" aria-hidden="true">RF</span><div><strong>Registrul Fermierului</strong><small>Workspace operațional · versiune de lucru</small></div></div>
      <div className="header-actions"><span className={'mode ' + (mode === 'api' ? 'api' : '')}><i />{mode === 'api' ? (isError ? 'API indisponibil' : 'API local') : 'Demonstrație statică'}</span><span className="synthetic-boundary">{DEMO_DATE_LABEL}</span><button type="button" className="avatar" aria-label="Profil utilizator">LD</button></div>
    </header>
    <main>
      <aside>
        <div className="eyebrow">OPERARE TEREN</div><h1>Registru agricol</h1><p className="muted">Fermieri, câmpuri și verificări într-un singur spațiu de lucru.</p>
        <label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search parcels" placeholder="Caută fermă, câmp sau ID…" value={query} onChange={event => updateFilter(() => setQuery(event.target.value))} /></label>
        <div className="filters" aria-label="Filtre registru">
          <select aria-label="Filtru fermă" value={farmFilter} onChange={event => updateFilter(() => setFarmFilter(event.target.value))}><option value="all">Toate fermele</option>{farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}</select>
          <select aria-label="Filtru cultură" value={cropFilter} onChange={event => updateFilter(() => setCropFilter(event.target.value))}><option value="all">Toate culturile</option>{cropOptions.map(crop => <option key={crop}>{crop}</option>)}</select>
          <select aria-label="Filtru status" value={statusFilter} onChange={event => updateFilter(() => setStatusFilter(event.target.value))}><option value="all">Toate statusurile</option><option value="Valid">Validat</option><option value="Review">În verificare</option><option value="Blocked">Blocat</option></select>
        </div>
        {isError && <div className="error" role="alert"><strong>Conexiunea API a eșuat.</strong><span>Nu sunt afișate date demo în modul API.</span></div>}
        <div className="list" aria-label="Parcel registry">
          {isLoading ? <p className="empty">Se încarcă registrul…</p> : filteredFields.length ? filteredFields.map(field => <button type="button" key={field.id} className={'parcel ' + (selected?.id === field.id ? 'active' : '')} onClick={() => selectField(field.id)}><span className={'dot ' + field.status.toLowerCase()} aria-hidden="true" /><span><b>{field.id}</b><small>{field.farmer} · {field.area} ha</small></span><span className="chevron" aria-hidden="true">›</span></button>) : <p className="empty">Nicio parcelă găsită.</p>}
        </div>
        <button type="button" className="primary" onClick={createTask} aria-label="Creează sarcină pentru câmpul selectat">＋ Creează sarcină</button>
        <button type="button" className="reset-link" onClick={resetDemo}>↺ Resetează demo local</button>
        <div className="side-footer"><span>{mode === 'api' ? 'Sursă: API local /parcels' : 'Sursă: fixture statică sintetică'}</span><span>Fără date reale, guvernamentale sau cadastrale</span></div>
      </aside>
      <section className="workspace">
        <div className="topline"><div><span className="crumb">Registru / Câmpuri / </span><b>{selected?.id ?? '—'}</b></div><button type="button" className="export" onClick={() => selected && exportField(selected)}>⇩ Exportă GeoJSON</button></div>
        <div className="stats"><article><span>Ferme urmărite</span><strong>{farms.length}</strong><em>{mode === 'api' ? 'deduse din răspuns' : 'date sintetice'}</em></article><article><span>Câmpuri în registru</span><strong>{fields.length}</strong><em>{fields.reduce((sum, field) => sum + field.area, 0).toFixed(1)} ha</em></article><article><span>Necesită verificare</span><strong>{pendingValidation}</strong><em className="warn">{openTaskCount} sarcini deschise</em></article></div>
        <div className="kpi-strip"><span><b>{openTaskCount}</b> sarcini deschise</span><span><b>{selectedObservations.filter(observation => observation.status === 'Pending').length}</b> observații în așteptare</span><span><b>{fields.filter(field => field.status === 'Valid').length}</b> câmpuri validate</span></div>
        <div className="map-card"><div className="map-toolbar"><div><b>Hartă de lucru</b><span className="badge">GeoJSON Polygon</span></div><span className="map-note">selectează un contur pentru a deschide fișa</span></div><MapView fields={filteredFields} selectedId={selected?.id} focusedId={focusedMapId} onSelect={selectField} /><div className="map-legend"><span><i className="legend valid" /> Validat</span><span><i className="legend review" /> În verificare</span><span><i className="legend blocked" /> Blocat</span><span><i className="legend selected" /> Selectat</span></div></div>
        {mode === 'api' && isSuccess && !fields.length && <div className="empty-state">Răspunsul API nu conține câmpuri. Nu au fost încărcate date demo.</div>}
        {selected ? <div className="detail-card"><div className="detail-head"><div><span className={'status-pill ' + selected.status.toLowerCase()}>● {statusLabel(selected.status)}</span><h2>{selected.farmer}</h2><p>{selected.fieldName ?? 'Câmp agricol'} · {selected.id} · {selected.area} ha</p></div><div className="detail-actions"><button type="button" className="outline" onClick={createTask}>＋ Sarcină</button><button type="button" className="outline" onClick={() => setActiveTab('observations')}>＋ Observație</button></div></div>
          <div className="tabs" role="tablist" aria-label="Secțiuni fișă câmp">{([['overview', 'Privire generală'], ['cycle', 'Ciclu cultură'], ['tasks', `Sarcini (${selectedTasks.length})`], ['observations', `Observații (${selectedObservations.length})`], ['audit', 'Istoric audit']] as const).map(([id, label]) => <button type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'active' : ''} key={id} onClick={() => setActiveTab(id)}>{label}</button>)}</div>
          <div className="tab-content">
            {activeTab === 'overview' && <div className="detail-grid"><div><span>Fermă</span><b>{selected.farmName ?? selected.farmer}</b></div><div><span>Cultură</span><b>{selected.crop}</b></div><div><span>Geometrie</span><b>{selected.geometry.type} · {selected.geometry.coordinates[0].length - 1} puncte</b></div><div><span>Centru</span><b>{selected.center[0].toFixed(4)}, {selected.center[1].toFixed(4)}</b></div></div>}
            {activeTab === 'cycle' && <div className="cycle-grid"><div><span>Sezon</span><b>{selected.season ?? 'Nespecificat'}</b></div><div><span>Data plantării</span><b>{selected.plantingDate ?? 'Nespecificată'}</b></div><div><span>Fereastră recoltă</span><b>{selected.harvestWindow ?? 'Nespecificată'}</b></div><div><span>Suprafață</span><b>{selected.area.toFixed(1)} ha</b></div></div>}
            {activeTab === 'tasks' && <div className="tab-panel"><button type="button" className="small-primary" onClick={createTask}>＋ Creează sarcină sintetică</button>{selectedTasks.length ? <div className="task-list">{selectedTasks.map(task => <div className="task-row" key={task.id}><span className={'priority ' + task.priority.toLowerCase()}>{task.priority}</span><div><b>{task.title}</b><small>{task.id} · termen {task.dueDate} · {task.assignee}</small></div><span className={'task-status ' + task.status.toLowerCase()}>{taskStatusLabel(task.status)}</span>{task.status !== 'Completed' && <button type="button" className="text-button" onClick={() => completeTask(task.id)}>Marchează finalizată</button>}</div>)}</div> : <p className="empty">Nicio sarcină pentru acest câmp.</p>}</div>}
            {activeTab === 'observations' && <div className="tab-panel"><form className="observation-form" onSubmit={addObservation}><textarea aria-label="Notă observație" placeholder="Scrie o observație sintetică…" value={observationNote} onChange={event => setObservationNote(event.target.value)} /><select aria-label="Categorie observație" value={observationCategory} onChange={event => setObservationCategory(event.target.value as Observation['category'])}><option>Cultură</option><option>Irigare</option><option>Dăunători</option><option>Infrastructură</option></select><button type="submit" className="small-primary">Adaugă observație</button></form>{selectedObservations.length ? <div className="observation-list">{selectedObservations.map(observation => <div className="observation-row" key={observation.id}><div><span className={'observation-status ' + observation.status.toLowerCase()}>{observationStatusLabel(observation.status)}</span><b>{observation.note}</b><small>{observation.id} · {observation.category} · {observation.author} · {observation.observedAt}</small></div>{observation.status !== 'Approved' && <div className="row-actions"><button type="button" className="text-button" onClick={() => reviewObservation(observation.id, 'Approved')}>Aprobă</button><button type="button" className="text-button muted-action" onClick={() => reviewObservation(observation.id, 'NeedsReview')}>Trimite la revizie</button></div>}</div>)}</div> : <p className="empty">Nicio observație pentru acest câmp.</p>}</div>}
            {activeTab === 'audit' && <div className="audit-list">{selectedActivity.length ? selectedActivity.map(record => <div className="audit-row" key={record.id}><span className="audit-dot" /><div><b>{record.action}</b><small>{record.detail} · {record.actor}</small></div><time>{record.at}</time></div>) : <p className="empty">Nu există activitate pentru acest câmp.</p>}</div>}
          </div>
        </div> : <div className="detail-card empty">{isLoading ? 'Se încarcă fișa câmpului…' : 'Selectează un câmp pentru detalii.'}</div>}
      </section>
    </main>
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}
