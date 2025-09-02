// Servicio para subir QR a objects API
export async function uploadQrToObjects({ name, data }) {
  const res = await fetch('http://localhost:3002/api/objects/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, data }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error ${res.status} al subir QR: ${text || res.statusText}`);
  }
  return res.json(); // { id, name, url }
}
