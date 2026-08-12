import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GeoJSON, MapContainer, useMapEvents } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { LeafletMouseEvent } from 'leaflet';
import { loadParcels } from './api';
import './styles.css';

export type ParcelStatus = 'Valid' | 'Review' | 'Blocked';
export type Parcel = {
  id: string;
  farmer: string;
  area: number;
  status: ParcelStatus;
  crop: string;
  center: [number, number];
  geometry: { type: 'Polygon'; coordinates: number[][][] };
};
export type DataMode = 'demo' | 'api';

export const demoParcels: Parcel[] = [
  { id: 'SYN-DEMO-001', farmer: 'Demo Fermier Exemplu', area: 42.8, status: 'Valid', crop: 'Grâu', center: [47.02, 28.84], geometry: { type: 'Polygon', coordinates: [[[28.835, 47.015], [28.845, 47.015], [28.845, 47.025], [28.835, 47.025], [28.835, 47.015]]] } },
  { id: 'SYN-DEMO-002', farmer: 'Exemplu Fermier Demo', area: 18.3, status: 'Review', crop: 'Porumb', center: [47.04, 28.88], geometry: { type: 'Polygon', coordinates: [[[28.874, 47.034], [28.886, 47.034], [28.886, 47.046], [28.874, 47.046], [28.874, 47.034]]] } },
  { id: 'SYN-DEMO-003', farmer: 'Demo Exploatație Exemplu', area: 64.1, status: 'Valid', crop: 'Floarea-soarelui', center: [46.98, 28.92], geometry: { type: 'Polygon', coordinates: [[[28.912, 46.972], [28.928, 46.972], [28.928, 46.988], [28.912, 46.988], [28.912, 46.972]]] } },
];

export const dataMode = (): DataMode => import.meta.env.VITE_FARM_REGISTRY_MODE === 'api' ? 'api' : 'demo';

function MapClick() { useMapEvents({ click: (event: LeafletMouseEvent) => console.info('map-click', event.latlng) }); return null; }

function toFeatureCollection(items: Parcel[]): FeatureCollection<Geometry> {
  return { type: 'FeatureCollection', features: items.map((parcel): Feature<Geometry> => ({ type: 'Feature', properties: { id: parcel.id, status: parcel.status }, geometry: parcel.geometry })) };
}

export function geoJsonLayerKey(items: Parcel[]): string {
  return items.map(parcel => `${parcel.id}:${JSON.stringify(parcel.geometry)}`).join('|');
}

function MapView({ parcels, selectedId, onSelect }: { parcels: Parcel[]; selectedId?: string; onSelect: (id: string) => void }) {
  if (import.meta.env.MODE === 'test') {
    return <div className="map test-map" aria-label="Parcel geometry map"><span>Leaflet geometry preview</span><small>{parcels.map(parcel => `${parcel.id}: ${parcel.geometry.coordinates[0].length - 1} points`).join(' · ')}</small></div>;
  }
  return <MapContainer center={[47.02, 28.86]} zoom={11} scrollWheelZoom={false} className="map" aria-label="Parcel geometry map">
    <GeoJSON key={geoJsonLayerKey(parcels)} data={toFeatureCollection(parcels)} style={feature => ({ color: feature?.properties?.id === selectedId ? '#d66b39' : feature?.properties?.status === 'Review' ? '#d18b25' : '#168a76', weight: feature?.properties?.id === selectedId ? 3 : 2, fillOpacity: feature?.properties?.id === selectedId ? 0.2 : 0.1 })} eventHandlers={{ click: event => { const id = event.propagatedFrom?.feature?.properties?.id; if (id) onSelect(id); } }} />
    <MapClick />
  </MapContainer>;
}

const labels = { search: 'Caută fermier sau ID…', mode: 'Demonstrație statică', title: 'Parcele agricole', subtitle: 'Registru operațional · date sintetice explicite', map: 'Harta geometriei parcelelor', condition: 'Condiție de validare', valid: 'Geometrie validată', review: 'Necesită verificare', blocked: 'Blocată la validare' };

export default function App({ mode = dataMode() }: { mode?: DataMode }) {
  const t = labels;
  const [selectedId, setSelectedId] = useState<string | undefined>(demoParcels[0].id);
  const [query, setQuery] = useState('');
  const { data = [], isLoading, isError } = useQuery({ queryKey: ['parcels', mode], queryFn: mode === 'api' ? loadParcels : async () => demoParcels, retry: false });
  const filtered = useMemo(() => data.filter(parcel => `${parcel.id} ${parcel.farmer} ${parcel.crop}`.toLowerCase().includes(query.toLowerCase())), [data, query]);
  const selected = data.find(parcel => parcel.id === selectedId) ?? filtered[0];
  const condition = selected?.status === 'Valid' ? t.valid : selected?.status === 'Review' ? t.review : t.blocked;

  return <div className="app"><header><div className="brand"><span className="brand-mark" aria-hidden="true">RF</span><div><strong>Registrul Fermierului</strong><small>Companion de birou · demo verificabil</small></div></div><div className="header-actions"><span className={'mode '+(mode === 'api' ? 'api' : '')}><i />{mode === 'api' ? (isError ? 'API indisponibil' : 'API local') : t.mode}</span><button type="button" className="avatar" aria-label="Profil utilizator">LD</button></div></header>
    <main><aside><div className="eyebrow">OPERARE TEREN</div><h1>{t.title}</h1><p className="muted">{t.subtitle}</p><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search parcels" placeholder={t.search} value={query} onChange={event => setQuery(event.target.value)} /></label>
      {isError && <div className="error" role="alert"><strong>Conexiunea API a eșuat.</strong><span>Nu sunt afișate date demo în modul API.</span></div>}
      <div className="list" aria-label="Parcel registry">{isLoading ? <p className="empty">Se încarcă registrul…</p> : filtered.length ? filtered.map(parcel => <button type="button" key={parcel.id} className={'parcel '+(selected?.id === parcel.id ? 'active' : '')} onClick={() => setSelectedId(parcel.id)}><span className={'dot '+parcel.status.toLowerCase()} aria-hidden="true" /><span><b>{parcel.id}</b><small>{parcel.farmer} · {parcel.area} ha</small></span><span className="chevron" aria-hidden="true">›</span></button>) : <p className="empty">Nicio parcelă găsită.</p>}</div><button type="button" className="primary" disabled>＋ Adaugă parcelă <span>(în curând)</span></button><div className="side-footer"><span>{mode === 'api' ? 'Sursă: API local /parcels' : 'Sursă: fixture statică sintetică'}</span><span>Fără date guvernamentale sau cadastrale</span></div>
    </aside><section className="workspace"><div className="topline"><div><span className="crumb">Registru / Parcele / </span><b>{selected?.id ?? '—'}</b></div><button type="button" className="export" disabled={!selected} aria-label="Exportă geometria GeoJSON">⇩ Export GeoJSON</button></div><div className="stats"><article><span>Parcele încărcate</span><strong>{data.length}</strong><em>din sursa curentă</em></article><article><span>Suprafață înregistrată</span><strong>{data.reduce((sum, parcel) => sum + parcel.area, 0).toFixed(1)} ha</strong><em>date sintetice</em></article><article><span>Necesită verificare</span><strong>{data.filter(parcel => parcel.status !== 'Valid').length}</strong><em className="warn">condiție de validare</em></article></div><div className="map-card"><div className="map-toolbar"><div><b>{t.map}</b><span className="badge">GeoJSON Polygon</span></div><span className="map-note">contur primit de la sursă</span></div><MapView parcels={data} selectedId={selected?.id} onSelect={setSelectedId} /><div className="map-legend"><span><i className="legend valid" /> Validată</span><span><i className="legend review" /> În verificare</span><span><i className="legend selected" /> Selectată</span></div></div>{selected ? <div className="detail-card"><div><div className="detail-title"><span className={'status-pill '+selected.status.toLowerCase()}>● {condition}</span><h2>{selected.farmer}</h2><p>{selected.id} · parcela agricolă · {selected.area} ha</p></div><div className="detail-grid"><div><span>Cultură</span><b>{selected.crop}</b></div><div><span>Geometrie</span><b>{selected.geometry.type} · {selected.geometry.coordinates[0].length - 1} puncte</b></div><div><span>Centru</span><b>{selected.center[0].toFixed(4)}, {selected.center[1].toFixed(4)}</b></div></div></div><button type="button" className="outline" onClick={() => setSelectedId(selected.id)}>Fișa parcelei ↗</button></div> : <div className="detail-card empty">Selectează o parcelă pentru detalii.</div>}</section></main></div>;
}
