import api from '../../auth/services/api';

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); 
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const toBase64Payload = async (input, meta = {}) => {
  if (typeof input === 'string') {
    if (input.startsWith('data:')) {
      const [header, b64] = input.split(',');
      const mime = header.match(/data:(.*?);base64/)?.[1] || meta.contentType || 'application/octet-stream';
      return { data: b64, contentType: mime, name: meta.name || 'upload' };
    }
    return { data: input, contentType: meta.contentType || 'application/octet-stream', name: meta.name || 'upload' };
  }
  const dataURL = await fileToDataURL(input);
  const [header, b64] = dataURL.split(',');
  const mime = header.match(/data:(.*?);base64/)?.[1] || input.type || meta.contentType || 'application/octet-stream';
  const name = meta.name || input.name || 'upload';
  return { data: b64, contentType: mime, name };
};

export const uploadObject = async (fileOrDataUrl, meta = {}) => {
  try {
    const { data, name, contentType } = await toBase64Payload(fileOrDataUrl, meta);
    const res = await api.post('/objects/create', { name, contentType, data });
    const r = res.data || {};
    const finalId = r.id ?? r.objectId ?? r.object_id ?? r.data?.id ?? null;
    if (!finalId) throw new Error('La API no devolvió un id de objeto');
    return { id: String(finalId) };
  } catch (err) {
    const data = err.response?.data;
    const message =
      data?.message || data?.error || (typeof data === 'string' ? data : JSON.stringify(data)) || err.message;
    throw new Error(message);
  }
};

// Devuelve un src listo para <img>: data URL o blob URL
export const getObjectBlobUrl = async (id) => {
  try {
    const res = await api.get(`/objects/get/${id}`);
    const { data, contentType, url } = res.data || {};
    if (data && typeof data === 'string') {
      return `data:${contentType || 'application/octet-stream'};base64,${data}`;
    }
    if (url) return url; 
  } catch (_) {
  }
  const resBlob = await api.get(`/objects/get/${id}`, { responseType: 'blob' });
  const ct = resBlob.headers?.['content-type'] || 'application/octet-stream';
  const blob = new Blob([resBlob.data], { type: ct });
  return URL.createObjectURL(blob);
};