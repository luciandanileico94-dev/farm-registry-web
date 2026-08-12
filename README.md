# Registrul Fermierului — demonstrație web

Demonstrație publică, autonomă, pentru un portofoliu de tender. Nu este produs oficial MAIA, nu este copie a unui sistem închis și nu pretinde experiență, utilizatori, clienți sau integrări guvernamentale. Toate datele afișate trebuie tratate ca sintetice.

## Ce face

- interfață React + TypeScript, în primul rând în română, responsive și cu controale accesibile;
- încarcă parcele exclusiv prin REST `GET /parcels`;
- afișează stări distincte pentru încărcare, eroare, răspuns gol și filtrare fără rezultate;
- vizualizează poligoane GeoJSON pe Leaflet și permite selectarea unei parcele;
- calculează sumarul din răspunsul API, fără statistici precompletate.

## Arhitectură

`src/api.ts` este granița REST și propagă erorile către React Query. `src/App.tsx` gestionează starea de încărcare, selecția și filtrarea, iar `src/styles.css` definește layout-ul responsive. Testele din `src/test/App.test.tsx` verifică datele API, eroarea REST, retry-ul și răspunsul gol.

Setează `VITE_API_URL` pentru host-ul serviciului. Implicit, aplicația încearcă `http://127.0.0.1:8000/parcels`.

## Rulare și verificare

```bash
npm ci
npm run dev
npm test -- --run
npm run build
```

CI rulează `npm ci`, testele și build-ul la push și pull request.

## Limitări

Proiectul nu include backend, autentificare, persistență, date cadastrale, integrare WMS sau date guvernamentale. Tile-urile hărții provin de la OpenStreetMap în browser; disponibilitatea lor depinde de serviciul extern. Endpoint-ul REST trebuie furnizat separat.

Îmbunătățirile curente sunt post-submission. Tag-ul `submission-21663739-2026-08-12` păstrează starea trimisă inițial; istoricul nu este rescris.
