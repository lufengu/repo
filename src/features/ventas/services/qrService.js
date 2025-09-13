function buildDataUrl(base64, mime = 'image/png') {
  if (!base64) return null;
  return `data:${mime};base64,${base64}`;
}

export function normalizeQrImageJson(json, { preferSignedUrl = true } = {}) {
  if (!json || typeof json !== 'object') return { src: null, meta: {} };

  const signed = json.signedUrl || json.signed_url || json.url || json.href;
  if (preferSignedUrl && signed) {
    return { src: signed, meta: { type: 'signed-url' } };
  }

  // Campos posibles para base64 y mime
  const base64 =
    json.imageBase64 || json.base64 || json.image || json.data || json.payload;
  const mime =
    json.mimeType || json.mimetype || json.contentType || json.type || 'image/png';

  const src = buildDataUrl(base64, mime);
  return { src, meta: { type: 'data-url', mime } };
}

export async function fetchQrImage(url, { token, preferSignedUrl = true, signal } = {}) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error ${res.status} al obtener QR: ${text || res.statusText}`);
  }

  const json = await res.json();
  const { src, meta } = normalizeQrImageJson(json, { preferSignedUrl });
  return { src, meta, json };
}