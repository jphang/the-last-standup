import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { configureLogger, consoleTransport, createRemoteTransport } from './lib/logger';

if (import.meta.env.DEV) {
  configureLogger({
    transports: [
      consoleTransport,
      createRemoteTransport({
        endpoint: import.meta.env.VITE_LOG_ENDPOINT ?? '/__logs',
      }),
    ],
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
