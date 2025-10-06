import axios from "axios";

const baseURL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "http://localhost:3002/api";
// Cliente dedicado sin interceptores ni Authorization
const healthApi = axios.create({ baseURL });

// Singleton/caché para evitar múltiples requests
let inflight = null;
let completed = false;
let lastResult = null;
    
export async function verifyServiceStatus() {
  if (completed && lastResult) return lastResult;
  if (inflight) return inflight;

  inflight = healthApi
    .get("/auth/verify-service-status")
    .then((res) => {
      lastResult = { ok: true, status: res.status, data: res.data };
      completed = true;
      return lastResult;
    })
    .catch((error) => {
      lastResult = {
        ok: false,
        status: error.response?.status ?? null,
        error: error.message,
        data: error.response?.data,
      };
      completed = true;
      return lastResult;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
