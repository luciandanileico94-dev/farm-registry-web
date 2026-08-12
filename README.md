# Farm Registry Web

**Operational workspace for reviewing farms, fields, tasks, observations, and parcel geometry.**

[Open the live demo](https://farm-registry-web.vercel.app)

Un workspace web în limba română pentru explorarea unui registru agricol demonstrativ: operatorii pot filtra câmpuri, inspecta contururi și gestiona local fluxuri de verificare. The application is a portfolio demo built around deterministic synthetic data, with an explicit client boundary for a compatible parcel API.

> **Demo boundary:** the default and publicly hosted experience contains synthetic fixtures only. It does not contain secrets, private GPS traces, cadastral records, government datasets, or real client/farmer data.

## Product workflows

| Area | What is implemented |
| --- | --- |
| Dashboard | KPIs for tracked farms, registered fields, fields requiring review, open tasks, pending observations, total area, and validated fields. |
| Farm and field discovery | Free-text search across IDs, farmers, crops, farm names, and field names; combinable farm, crop, and validation-status filters. |
| Field workspace | Select a field from the registry or its polygon, then move through **Overview**, **Crop cycle**, **Tasks**, **Observations**, and **Audit history** tabs. |
| Tasks | Create a synthetic field task and mark an open task as completed. Demo mutations stay in the browser. |
| Observations | Add a categorized synthetic note, approve it, or send it for review. Each local action also adds an audit entry. |
| Audit | Read the selected field's chronological activity records, including locally generated task and observation events. |
| GeoJSON export | Download the selected field as a GeoJSON `Feature` with its polygon and operational properties. |
| Local reset | Clear browser changes and restore the deterministic demo workspace to its initial fixtures. |

The demo starts with 6 fictional farms and 12 closed GeoJSON `Polygon` fields. Demo state is persisted under a versioned `localStorage` key; if browser storage is unavailable, the fixture remains usable for the current session.

## Map and GeoJSON scope

The map uses Leaflet through React Leaflet to render and select the GeoJSON polygon layer. Geometry is transformed into a `FeatureCollection`, styled by field status, and recreated when field geometry changes. Export is generated entirely in the browser for the currently selected field.

The current implementation does **not** configure a Leaflet `TileLayer`. Consequently, no street/satellite basemap, government layer, cadastral overlay, or other public-data layer is bundled or fetched. The map is intentionally limited to the synthetic GeoJSON contours on Leaflet's map canvas.

## Data modes

### Synthetic demo (default)

No environment configuration is required. Farms, fields, tasks, observations, and audit records come from [`src/fixtures.ts`](src/fixtures.ts). All fixture identifiers use the `SYN-` prefix, and local UI mutations are stored only in the visitor's browser.

### API boundary (optional)

```bash
VITE_FARM_REGISTRY_MODE=api \
VITE_API_URL=http://127.0.0.1:8000 \
npm run dev
```

[`src/api.ts`](src/api.ts) defines client functions for farms, fields, tasks, and observations. The application currently reads fields through `GET /parcels`, matching the existing Python parcel contract. API loading, empty, and error states are explicit; an API failure never silently falls back to demo fixtures.

Only parcel reads are connected to the current React workspace. Tasks, observations, and their audit events created from the UI remain local; there are no backend mutations or claimed cross-client synchronization.

## Architecture and related projects

| Component | Responsibility and current relationship |
| --- | --- |
| **farm-registry-web** | This repository: a Vite-built React client, static demo fixtures, browser-local workflow state, and an Axios/React Query API boundary. |
| [**farm-registry-mobile**](https://github.com/luciandanileico94-dev/farm-registry-mobile) | Separate mobile client for field-oriented observation capture. It is a related product surface, not a module bundled into this web app, and direct synchronization is not implemented here. |
| [**farm-registry-python-tools**](https://github.com/luciandanileico94-dev/farm-registry-python-tools) | Separate Python API/geospatial tooling. Its `/parcels` response is the compatibility target for the web client's API mode. |

The live Vercel URL serves the static web application and synthetic demo. An API integration boundary exists, but no Render blueprint or Render service is deployed from this repository; there is no live Render API to claim. A real API-mode deployment would require a separately hosted, CORS-enabled backend plus `VITE_FARM_REGISTRY_MODE` and `VITE_API_URL` configured at build time.

## Stack

- React 18 and React DOM
- TypeScript 5.6
- Vite 5
- TanStack React Query 5 and Axios
- Leaflet 1.9 and React Leaflet 4
- CSS responsive layout
- Vitest, jsdom, Testing Library, and jest-dom

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL. The default mode is the self-contained synthetic demo.

## Verification

The repository exposes these checks through `package.json` scripts:

```bash
npm run lint
npm test
npm run build
```

- `npm run lint` performs the TypeScript no-emit check.
- `npm test` runs the Vitest suite once.
- `npm run build` runs the TypeScript project build and produces the Vite production bundle.

Tests cover fixture/geometry invariants, search and combined filters, field selection, task completion, observation approval, API loading/empty/error isolation, and browser-side GeoJSON export.
