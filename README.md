# Farm Registry Web

## Ce este

Un workspace web **Romanian-first** pentru explorarea unui registru agricol sintetic. Aplicația reunește ferme, câmpuri, verificări și activități într-o interfață React; este un demo tehnic, nu un registru oficial și nu este prezentat ca produs production-ready.

## Demo live

- [Deschide aplicația web](https://farm-registry-web.vercel.app)
- [API demo](https://farm-registry-api-demo.onrender.com) · [documentație API](https://farm-registry-api-demo.onrender.com/docs)

Deployment-ul Web este configurat în API mode cu `VITE_FARM_REGISTRY_MODE=api` și `VITE_API_URL=https://farm-registry-api-demo.onrender.com`. Calea de citire este conectată la API-ul găzduit pe Render; backend-ul este exclusiv sintetic și limitat la scopul demonstrației.

## Capabilități

- dashboard responsive și KPI pentru ferme, câmpuri, validări și sarcini deschise;
- căutare și filtre după fermă, cultură și status;
- hartă Leaflet cu geometrii GeoJSON Polygon și selecția câmpului;
- fișă de câmp cu privire generală, ciclu de cultură, sarcini, observații și istoric audit;
- creare/finalizare de sarcini și adăugare/aprobare/revizie de observații în starea locală a demo-ului;
- export GeoJSON pentru câmpul selectat și resetarea datelor demo locale.

Scenariul local inclus conține 6 ferme și 12 câmpuri fictive și persistă modificările demo în `localStorage`.

## Stack

- React, TypeScript și Vite;
- TanStack Query și Axios pentru calea de citire API;
- Leaflet și React Leaflet pentru hartă;
- GeoJSON pentru geometriile și exportul câmpurilor;
- Vitest și Testing Library pentru teste.

## Rulare locală

```bash
npm install
npm run dev
```

Modul implicit este demo și folosește fixtures sintetice locale. Verificările proiectului pot fi rulate cu:

```bash
npm test
npm run build
```

## Mod API și variabile de mediu

Pentru a porni clientul local folosind API-ul demo:

```bash
VITE_FARM_REGISTRY_MODE=api \
VITE_API_URL=https://farm-registry-api-demo.onrender.com \
npm run dev
```

În API mode, clientul încarcă lista de câmpuri prin `GET /parcels` și afișează explicit stările de încărcare, eroare și răspuns gol, fără fallback automat la fixtures. Fluxurile de mutation din interfață rămân locale și nu trebuie interpretate drept sincronizare completă sau persistență production-grade.

## Limita datelor sintetice

Toate fermele, persoanele, sarcinile, observațiile, coordonatele și geometriile din acest proiect sunt sintetice. Nu sunt folosite date reale despre fermieri, date cadastrale, trasee sau puncte GPS reale ori date cu caracter personal. Proiectul nu declară integrări cu registre guvernamentale, o bază de date persistentă de producție sau pregătire pentru utilizare în producție.

## Proiecte asociate

- [Farm Registry Mobile](https://github.com/luciandanileico94-dev/farm-registry-mobile)
- [Farm Registry Python Tools](https://github.com/luciandanileico94-dev/farm-registry-python-tools)
