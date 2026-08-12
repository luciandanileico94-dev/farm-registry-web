# Farm Registry Web

Portfolio-demo для закупки MAIA **Servicii Front End & Python Developer (junior)**. Это самостоятельная демонстрация интерфейса, не официальный продукт MAIA и не копия закрытой системы.

## Что демонстрирует

- React + TypeScript + responsive UI на румынском языке;
- интерактивная карта на Leaflet с GeoJSON-полигонами и выбором parcel;
- state management через React Query и локальный UI state;
- поиск, статусы валидации и доступный keyboard-friendly UI;
- тест, CI и production build.

## Соответствие критериям закупки

| Требование | Доказательство |
|---|---|
| React / TypeScript | `src/App.tsx`, `src/main.tsx` |
| GIS / GeoJSON / Leaflet | `MapContainer`, `GeoJSON` в `src/App.tsx` |
| REST-ready data layer | dependency `axios`, QueryClient boundary |
| Tests / CI | `src/test/App.test.tsx`, `.github/workflows/ci.yml` |
| Git workflow | feature branches, pull requests и review-ready commits |

## Запуск

```bash
npm install
npm run dev
npm test
npm run build
```

Связанные проекты: [Python geospatial tools](https://github.com/luciandanileico94-dev/farm-registry-python-tools) · [React Native field app](https://github.com/luciandanileico94-dev/farm-registry-mobile).

> Demo data is synthetic. No personal, cadastral or government data is included.
