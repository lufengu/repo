import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'
import { verifyServiceStatus } from './services/healthService'

// Ejecuta solo una vez por pestaña usando sessionStorage (sobrevive a HMR y StrictMode)
try {
  const KEY = 'healthCheck:done';
  const already = sessionStorage.getItem(KEY);
  if (!already) {
    sessionStorage.setItem(KEY, '1');
    verifyServiceStatus()
      .then(res => {
        if (res.ok) console.info('Servicio backend OK:', res.status, res.data)
        else console.warn('Backend no disponible:', res.status, res.error, res.data)
      })
      .catch(err => console.warn('Error health check:', err))
  }
} catch {
  // Fallback si sessionStorage no está disponible
  if (!globalThis.__healthCheckTriggered) {
    globalThis.__healthCheckTriggered = true;
    verifyServiceStatus().catch(() => {});
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
