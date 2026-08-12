import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GeoJSON, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { DATA_MODE, loadParcels } from './api';
import './styles.css';

export type Parcel = {
  id: string;
  farmer: string;
  area: number;
  status: 'Valid' | 'Review' | 'Blocked';
  crop: string;
  center: [number, number];
};

function parcelGeoJson(parcels: Parcel[]) {
  return {
    type: 'FeatureCollection',
    features: parcels.map((parcel) => ({
      type: 'Feature',
      properties: { id: parcel.id },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [parcel.center[1] - 0.02, parcel.center[0] - 0.02],
          [parcel.center[1] + 0.02, parcel.center[0] - 0.02],
          [parcel.center[1] + 0.02, parcel.center[0] + 0.02],
          [parcel.center[1] - 0.02, parcel.center[0] + 0.02],
          [parcel.center[1] - 0.02, parcel.center[0] - 0.02],
        ]],
      },
    })),
  };
}

function MapClick() {
  useMapEvents({ click: (event: LeafletMouseEvent) => console.info('map-click', event.latlng) });
  return null;
}

function MapActions() {
  const map = useMap();
  return <div className="map-actions" aria-label="Controale hartă">
    <button type="button" onClick={() => map.locate()} aria-label="Localizează-mă">⌖ Localizare</button>
    <button type="button" onClick={() => map.zoomIn()} aria-label="Mărește harta">＋</button>
    <button type="button" onClick={() => map.zoomOut()} aria-label="Micșorează harta">−</button>
  </div>;
}

function MapView({ parcels, selectedId, onSelect }: { parcels: Parcel[]; selectedId: string; onSelect: (id: string) => void }) {
  const geojson = parcelGeoJson(parcels);
  if (import.meta.env.MODE === 'test') return <div className="map test-map" aria-label="Hartă parcele">Previzualizare hartă</div>;
  return <MapContainer center={[47.02, 28.86]} zoom={11} scrollWheelZoom={false} className="map">
    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <GeoJSON data={geojson as never} style={(feature) => ({ color: feature?.properties?.id === selectedId ? '#d66b39' : '#168a76', weight: 2, fillOpacity: feature?.properties?.id === selectedId ? 0.16 : 0.08 })} eventHandlers={{ click: (event) => { const id = event.propagatedFrom?.feature?.properties?.id; if (id) onSelect(id); } }} />
    <MapActions />
    <MapClick />
  </MapContainer>;
}

const statusLabels = { Valid: 'Validată', Review: 'În verificare', Blocked: 'Blocată' };

export default function App() {
  const [selectedId, setSelectedId] = useState<string>();
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<'RO' | 'EN'>('RO');
  const parcelsQuery = useQuery({ queryKey: ['parcels'], queryFn: loadParcels, retry: false });
  const apiParcels = parcelsQuery.data ?? [];
  const filtered = useMemo(() => apiParcels.filter((parcel) => `${parcel.id} ${parcel.farmer} ${parcel.crop}`.toLowerCase().includes(query.toLowerCase())), [apiParcels, query]);
  const selected = apiParcels.find((parcel) => parcel.id === selectedId) ?? filtered[0];
  const totalArea = apiParcels.reduce((total, parcel) => total + parcel.area, 0);
  const reviewCount = apiParcels.filter((parcel) => parcel.status === 'Review').length;

  return <div className="app"><header><div className="brand"><span className="brand-mark">RF</span><div><strong>Registrul Fermierului</strong><small>IACS / dNFR · demonstrație</small></div></div><div className="header-actions"><span className="api-source">{DATA_MODE === 'demo' ? 'Mod demo static' : 'API GET /parcels'}</span><button type="button" onClick={() => setLang(lang === 'RO' ? 'EN' : 'RO')} aria-label="Schimbă limba">{lang}</button></div></header><main><aside><div className="eyebrow">{lang === 'RO' ? 'OPERARE TEREN' : 'FIELD OPERATIONS'}</div><h1>{lang === 'RO' ? 'Parcele agricole' : 'Agricultural parcels'}</h1><p className="muted">{lang === 'RO' ? 'Monitorizare și validare geospațială' : 'Geospatial monitoring and validation'}</p><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Caută parcele" placeholder={lang === 'RO' ? 'Caută fermier sau ID…' : 'Search farmer or ID…'} value={query} onChange={(event) => setQuery(event.target.value)} /></label>{parcelsQuery.isLoading && <p role="status" className="state">Se încarcă parcelele…</p>}{parcelsQuery.isError && <div role="alert" className="state error"><b>Parcele indisponibile</b><span>Endpoint-ul GET /parcels nu a putut fi accesat.</span><button type="button" onClick={() => parcelsQuery.refetch()}>Încearcă din nou</button></div>}{parcelsQuery.isSuccess && apiParcels.length === 0 && <p className="state">API-ul a răspuns fără parcele.</p>}{parcelsQuery.isSuccess && apiParcels.length > 0 && filtered.length === 0 && <p className="state">Nu există rezultate pentru „{query}”.</p>}<div className="list">{filtered.map((parcel) => <button type="button" key={parcel.id} className={`parcel ${selected?.id === parcel.id ? 'active' : ''}`} onClick={() => setSelectedId(parcel.id)}><span className={`dot ${parcel.status.toLowerCase()}`} /><span><b>{parcel.id}</b><small>{parcel.farmer} · {parcel.area} ha</small></span><span className="chevron" aria-hidden="true">›</span></button>)}</div><div className="side-footer"><span>React + TypeScript</span><span>Datele afișate sunt sintetice.</span></div></aside><section className="workspace">{selected ? <><div className="topline"><div><span className="crumb">Dashboard / Parcele / </span><b>{selected.id}</b></div></div><div className="stats"><article><span>Parcele primite de la API</span><strong>{apiParcels.length}</strong></article><article><span>Suprafață înregistrată</span><strong>{totalArea.toFixed(1)} ha</strong></article><article><span>Necesită verificare</span><strong>{reviewCount}</strong></article></div><div className="map-card"><div className="map-toolbar"><div><b>Harta parcelelor</b><span className="badge">GeoJSON</span></div></div><MapView parcels={apiParcels} selectedId={selected.id} onSelect={setSelectedId} /><div className="map-legend"><span><i className="legend valid" /> Validată</span><span><i className="legend review" /> În verificare</span><span><i className="legend selected" /> Selectată</span></div></div><div className="detail-card"><div><div className="detail-title"><span className={`status-pill ${selected.status.toLowerCase()}`}>● {statusLabels[selected.status]}</span><h2>{selected.farmer}</h2><p>{selected.id} · parcela agricolă · {selected.area} ha</p></div><div className="detail-grid"><div><span>Cultură</span><b>{selected.crop}</b></div><div><span>Centroid</span><b>{selected.center[0].toFixed(4)}, {selected.center[1].toFixed(4)}</b></div></div></div></div></> : <div className="workspace-state"><h2>Registrul nu are date de afișat</h2><p>Conținutul va apărea după un răspuns cu parcele de la GET /parcels.</p></div>}</section></main></div>;
}
