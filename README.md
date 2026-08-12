# Farm Registry Web

## Workspace pentru verificări operaționale agricole

Farm Registry Web este un workspace **Romanian-first** pentru operatorii care inspectează ferme și câmpuri și urmăresc verificări operaționale. Oferă o vedere unitară asupra parcelelor, culturilor, sarcinilor, observațiilor și istoricului de audit, pentru ca un operator să poată găsi rapid un câmp și să documenteze activitatea de lucru din interfață.

Aplicația prezintă un flux de produs funcțional pe date publice sintetice; nu este un registru oficial și nu este pregătită pentru producție. Vezi [aplicația live](https://farm-registry-web.vercel.app) și [documentația API](https://farm-registry-api-demo.onrender.com/docs).

## Roluri și fluxuri disponibile

Interfața acoperă activitatea unui operator de teren sau de control care consultă și actualizează local starea de lucru a unui câmp selectat:

- pornește din dashboard pentru a vedea indicatorii de ferme, câmpuri, validări și sarcini deschise;
- caută și filtrează ferme/câmpuri după fermă, cultură și status;
- selectează un câmp din listă sau de pe hartă;
- consultă taburile câmpului selectat: privire generală, ciclu de cultură, sarcini, observații și audit;
- creează sau marchează sarcini ca finalizate în starea locală;
- adaugă observații și le aprobă sau le revizuiește în starea locală;
- verifică istoricul de audit, exportă câmpul selectat ca GeoJSON sau resetează datele demo locale.

Harta folosește geometrii GeoJSON Polygon pentru selectarea câmpurilor. Scenariul local include 6 ferme și 12 câmpuri fictive.

## Stack

- React, TypeScript și Vite;
- TanStack React Query și Axios;
- Leaflet și React Leaflet;
- GeoJSON;
- Vitest și Testing Library.

## Rulare locală

```bash
npm install
npm run dev
```

Scripturile disponibile în proiect sunt:

```bash
npm run dev
npm run build
npm test
npm run lint
```

## Mod API

În mod implicit, aplicația folosește fixtures sintetice locale. Pentru calea de citire conectată la API, pornește aplicația astfel:

```bash
VITE_FARM_REGISTRY_MODE=api \
VITE_API_URL=https://farm-registry-api-demo.onrender.com \
npm run dev
```

Variabilele de mediu sunt `VITE_FARM_REGISTRY_MODE=api` și `VITE_API_URL`. În acest mod, clientul citește parcelele prin `GET /parcels` de la API-ul găzduit pe Render și afișează stări de încărcare, eroare și răspuns gol, fără fallback automat la fixtures.

Sarcinile și observațiile rămân mutații locale: nu există mutații backend, persistență pe server sau sincronizare între clienți.

## Date și limite

Toate datele publice din aplicație sunt **doar sintetice**. Proiectul nu conține și nu trebuie folosit cu date private sau reale despre persoane, ferme, GPS, trasee, cadastru, credențiale ori secrete.

Modificările locale pot fi păstrate în `localStorage` doar în browserul curent și pot fi resetate din interfață. Calea API este limitată la citirea `GET /parcels`; ea nu transformă aplicația într-un sistem conectat complet. Nu există afirmații de autentificare, autorizare, persistență de producție, integrare cu registre oficiale sau pregătire pentru producție.

## Evidențe

- [Arhitectură bazată pe dovezi](docs/architecture.md)
- [Matrice de dovezi](docs/evidence-matrix.md)

## Proiecte asociate

- [Farm Registry Mobile](https://github.com/luciandanileico94-dev/farm-registry-mobile)
- [Farm Registry Python Tools](https://github.com/luciandanileico94-dev/farm-registry-python-tools)
