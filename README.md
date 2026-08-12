# Farm Registry Web

Portfolio-demo для закупки MAIA **Servicii Front End & Python Developer (junior)**. Это самостоятельная демонстрация интерфейса, не официальный продукт MAIA и не копия закрытой системы.

## Что демонстрирует

- React + TypeScript + responsive UI на румынском языке;
- Leaflet-карта, которая рисует `geometry` из API как GeoJSON Polygon;
- поиск, выбор записи и видимое условие валидации;
- явный static demo mode с тем же GeoJSON-контрактом;
- тесты и production build.

## Соответствие критериям закупки

| Требование | Доказательство |
|---|---|
| React / TypeScript | `src/App.tsx`, `src/main.tsx` |
| GIS / GeoJSON / Leaflet | `MapContainer`, `GeoJSON` в `src/App.tsx` |
| REST API integration | `src/api.ts` → `GET /parcels`; ошибка API не подменяется демо |
| State management | `useQuery({queryKey:['parcels']})` в `src/App.tsx` |
| Tests / CI | `src/test/App.test.tsx`, `.github/workflows/ci.yml` |
| Git workflow | feature branches, pull requests и review-ready commits |

## Режимы и локальное подключение API

По умолчанию приложение работает в статическом demo mode: это синтетические записи `SYN-DEMO-*`, сохранённые в `src/App.tsx`. Для подключения локального Python API запусти его на `http://127.0.0.1:8000`, затем запусти веб-клиент так:

```bash
VITE_FARM_REGISTRY_MODE=api VITE_API_URL=http://127.0.0.1:8000 npm run dev
```

Клиент делает только `GET /parcels`. Каждая запись API должна иметь поля `id`, `farmer`, `area`, `status`, `crop`, `center` и `geometry`, где `geometry.type` — `Polygon`, координаты — вложенные пары `[longitude, latitude]`, а `center` — `[latitude, longitude]`. При ошибке API интерфейс показывает ошибку и пустой registry; synthetic demo data не подставляются.

Static Vercel hosting не запускает Python API и не предоставляет `http://127.0.0.1:8000` посетителю. Поэтому задеплоенная статическая версия остаётся demo mode, если рядом отдельно не разместить API с разрешённым CORS и задать `VITE_FARM_REGISTRY_MODE=api` и `VITE_API_URL` до сборки.

## Запуск

```bash
npm install
npm run dev
npm test
npm run build
```

Связанные проекты: [Python geospatial tools](https://github.com/luciandanileico94-dev/farm-registry-python-tools) · [React Native field app](https://github.com/luciandanileico94-dev/farm-registry-mobile).

> Все показанные данные синтетические. Приложение не подключается к MAIA, MPass, MConnect, государственным или кадастровым системам и не содержит credentials.
