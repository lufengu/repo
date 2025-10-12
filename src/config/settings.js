// Configuración de entorno y URLs de la API
// Cambiar STAGE a 'LOCAL' cuando se desarrolle localmente, 'PRODUCTION' en despliegue
export const STAGE = import.meta.env.VITE_STAGE || 'LOCAL';

// Dominio base según ambiente
const BASE_DOMAIN = STAGE === 'LOCAL' ? 'localhost:3002' : 'techderos.com.co';

// Exporta base urls útiles — usar ENV_API_BASE si fue proporcionada
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (STAGE === 'LOCAL' ? `http://${BASE_DOMAIN}` : `https://${BASE_DOMAIN}`);
export const API_BASE_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

// Ejemplo de uso:
// import { API_BASE_URL } from '../config/settings';
// fetch(`${API_BASE_URL}/users?page=1&limit=8`)

export default {
  STAGE,
  BASE_DOMAIN,
  API_BASE,
  API_BASE_URL,
};
