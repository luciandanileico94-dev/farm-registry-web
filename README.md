# Farm Registry Web

Spațiu de lucru web, în limba română, pentru explorarea unui registru agricol sintetic. Este un demo de portofoliu: nu este prezentat ca produs pregătit pentru producție.

[Deschide demo-ul live](https://farm-registry-web.vercel.app) · [Documentația API](https://farm-registry-api-demo.onrender.com/docs)

## Ce include

- Dashboard cu indicatori pentru ferme, câmpuri, verificări, sarcini, observații, suprafață și câmpuri validate.
- Căutare și filtre combinate după fermă, cultură și status pentru ferme/câmpuri.
- Hartă [Leaflet](https://leafletjs.com/) cu contururi GeoJSON selectabile.
- Fișă de câmp cu taburi: **Privire generală**, **Ciclu cultură**, **Sarcini**, **Observații** și **Istoric audit**.
- Fluxuri locale pentru crearea/finalizarea sarcinilor și adăugarea, aprobarea sau trimiterea la revizie a observațiilor.
- Export GeoJSON pentru câmpul selectat și resetarea modificărilor demo locale.

Demo-ul implicit conține 6 ferme fictive și 12 câmpuri. Modificările făcute în acest mod sunt păstrate numai local în browser și pot fi resetate.

## Rulare locală

```bash
npm install
npm run dev
```

Stack: React, TypeScript, Vite, TanStack React Query, Axios, Leaflet și React Leaflet.

## Modul API

Pentru a porni clientul în modul Web API de producție, configurați:

```bash
VITE_FARM_REGISTRY_MODE=api \
VITE_API_URL=https://farm-registry-api-demo.onrender.com \
npm run dev
```

Calea de citire API este conectată la serviciul Render prin `GET /parcels`. Mutațiile pentru sarcini și observații, precum și persistența lor, nu sunt de nivel producție: ele rămân fluxuri locale în acest client și nu reprezintă integrare sau sincronizare reală.

## Limită de date

Aplicația folosește exclusiv date sintetice. Nu conține ferme reale, date cadastrale, trasee GPS, date private sau personale și nici secrete. Contururile GeoJSON și toate identitățile din demo sunt fictive.

## Proiecte conexe

- [farm-registry-mobile](https://github.com/luciandanileico94-dev/farm-registry-mobile)
- [farm-registry-python-tools](https://github.com/luciandanileico94-dev/farm-registry-python-tools)
