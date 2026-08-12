# Farm Registry Web

Client web React + TypeScript pentru un workspace operațional de registru agricol. Interfața este în primul rând în limba română și folosește exclusiv date sintetice în modul implicit. Nu este un produs oficial, nu reproduce o bază de date reală și nu se conectează la sisteme guvernamentale, cadastrale sau la endpoint-uri de producție.

## Ce include

- dashboard responsive pentru 6 ferme fictive și 12 câmpuri GeoJSON Polygon;
- KPI pentru ferme, câmpuri, validări în așteptare și sarcini deschise;
- căutare plus filtre după fermă, cultură și status;
- hartă Leaflet, selecție de câmp și fișă cu tab-uri pentru privire generală, ciclu de cultură, sarcini, observații și istoric audit;
- acțiuni locale funcționale: creare și finalizare sarcină, adăugare și aprobare/revizie observație, export GeoJSON și resetare demo;
- delimitare vizibilă `Date sintetice · scenariu local`. Starea demo este deterministă și se păstrează în `localStorage`.

Toate identificatoarele din fixtures au prefix `SYN-`; numele, fermierii, task-urile, observațiile și coordonatele sunt fictive.

## Moduri de date și client API

În mod implicit, aplicația folosește fixture statică locală. Pentru modul API:

```bash
VITE_FARM_REGISTRY_MODE=api VITE_API_URL=http://127.0.0.1:8000 npm run dev
```

`src/api.ts` este granița clientului pentru resursele `farms`, `fields`, `tasks` și `observations`. Pentru compatibilitate cu Python API-ul existent, câmpurile sunt citite prin `GET /parcels`; funcția `loadFields()` păstrează aceeași cale. Răspunsul de parcelă acceptă contractul existent (`id`, `farmer`, `area`, `status`, `crop`, `center`, `geometry`), iar câmpurile operaționale suplimentare sunt opționale.

În modul API, eroarea, încărcarea și răspunsul gol sunt afișate explicit. Clientul nu înlocuiește niciodată un răspuns API eșuat cu fixture demo. Acțiunile create în UI sunt locale până când un backend va expune mutații; interfața nu pretinde că le-a sincronizat.

## Rulare locală

```bash
npm install
npm run dev
npm test
npm run build
```

`npm run build` creează un client static. Hosting-ul static Vercel poate servi interfața și demo-ul, dar nu rulează Python API și nu poate face acces automat la `127.0.0.1` al vizitatorului. Pentru modul API este necesar un API separat, accesibil prin CORS permis, iar `VITE_FARM_REGISTRY_MODE` și `VITE_API_URL` trebuie setate înainte de build. Nu este configurat niciun URL de producție în acest repository.

## Proiecte asociate

- [Farm Registry Python API / geospatial tools](https://github.com/luciandanileico94-dev/farm-registry-python-tools) — API-ul Python compatibil cu `/parcels`.
- [Farm Registry Mobile](https://github.com/luciandanileico94-dev/farm-registry-mobile) — aplicația separată pentru colectarea observațiilor pe teren.

Aceste linkuri descriu proiectele asociate; acest client web nu publică credentials, date personale reale, GPS real sau identificatori cadastrali.
