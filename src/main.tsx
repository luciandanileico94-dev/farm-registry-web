import React from 'react'; import { createRoot } from 'react-dom/client'; import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; import 'leaflet/dist/leaflet.css'; import './styles.css'; import App from './App'; import { DATA_MODE } from './api';
document.body.dataset.dataMode = DATA_MODE;
createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={new QueryClient()}><App/></QueryClientProvider></React.StrictMode>);
