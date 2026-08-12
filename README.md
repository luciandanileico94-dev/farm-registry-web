# Registrul Fermierului — demonstrație web

Demonstrație publică, autonomă, pentru un portofoliu de tender. Nu este produs oficial MAIA, nu este copie a unui sistem închis și nu pretinde experiență, utilizatori, clienți sau integrări guvernamentale. Datele demo sunt evident sintetice.

## Stack

React 18, TypeScript, Vite, TanStack React Query, Axios, Leaflet și React-Leaflet. Testele folosesc Vitest, jsdom și Testing Library. CI rulează în Node 20.

## Architecture/data flow

`src/api.ts` este singura graniță de date. La build, `VITE_DATA_MODE` este citit explicit:

- `api` (implicit): Axios execută exclusiv `GET /parcels` la `VITE_API_URL` sau la `http://127.0.0.1:8000`; erorile și răspunsurile invalide sunt propagate.
- `demo`: adaptorul returnează numai `src/demo-data.ts`, un set local și stabil de fixture-uri `DEMO-*`; nu există fallback la API.

React Query consumă `loadParcels`, iar `App.tsx` calculează filtrarea, sumarul, stările și harta din rezultatul adaptorului. Interfața afișează explicit `Mod demo static` sau `API GET /parcels`. `vite.config.ts` primește `VITE_BASE_PATH` pentru hosting în subdirector.

## Functional behavior

- În modul API, încărcarea, eroarea REST, retry-ul, răspunsul gol și filtrarea fără rezultate au stări distincte; o eroare nu este ascunsă de date demo.
- În modul demo, aplicația este navigabilă fără backend și etichetează vizibil sursa statică.
- Lista, sumarul și poligoanele GeoJSON sunt derivate din datele încărcate. Se poate selecta o parcelă, căuta după ID/fermier și schimba limba interfeței.

## P1 criterion-to-file/test matrix

| Criteriu P1 | Implementare | Dovadă/test |
|---|---|---|
| Sursă API explicită, fără fallback | `src/api.ts`, `src/App.tsx` | `src/test/api.test.ts`, `src/test/App.test.tsx` |
| Demo static explicit și sintetic | `src/demo-data.ts`, `src/api.ts` | build cu `VITE_DATA_MODE=demo`; testul de fixture-uri |
| Eroare API vizibilă | `src/App.tsx` | testul „does not hide a REST failure” |
| Hosting Pages cu base path | `.github/workflows/pages.yml`, `vite.config.ts` | build Pages cu `VITE_BASE_PATH` |
| CI normal | `.github/workflows/ci.yml` | `npm ci`, lint, test, build fără `VITE_DATA_MODE` |

## local API mode

```bash
npm ci
VITE_API_URL=http://127.0.0.1:8000 npm run dev
```

Acesta este modul normal: aplicația încearcă numai `GET /parcels`. Pentru build local API: `npm run build`.

## static demo mode

```bash
VITE_DATA_MODE=demo npm run dev
VITE_DATA_MODE=demo npm run build
```

Demo-ul nu simulează un backend și nu folosește date reale. Workflow-ul `.github/workflows/pages.yml` construiește cu `VITE_DATA_MODE=demo` și `VITE_BASE_PATH=/<numele-repository-ului>/`, apoi publică `dist` în GitHub Pages.

## tests/live URL/limitations/post-submission tag

Verificare locală:

```bash
npm ci
npm run lint
npm test -- --run
npm run build
VITE_DATA_MODE=demo npm run build
npm audit --audit-level=high
```

Live URL: este furnizat de GitHub Pages după activarea workflow-ului; nu inventez un URL înainte de publicare.

Limitări: proiectul nu include backend, autentificare, persistență, date cadastrale, integrare WMS sau date guvernamentale. Tile-urile provin de la OpenStreetMap în browser și depind de serviciul extern. Endpoint-ul REST trebuie furnizat separat.

Tag-ul `submission-21663739-2026-08-12` păstrează starea trimisă inițial; istoricul nu este rescris. Îmbunătățirile curente sunt post-submission.
