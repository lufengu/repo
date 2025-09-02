import api from '../../auth/services/api';

export async function getQrUrlForMethod(method) {
  try {
    const res = await api.get('/qr/list');
    const qrList = res.data || [];
    const found = qrList.find(q => (q.name?.toLowerCase() || '').includes(method));
    if (found && found.object && found.object.url) {
      return found.object.url;
    } else if (found && found.object && found.object.data && found.object.contentType) {
      return `data:${found.object.contentType};base64,${found.object.data}`;
    }
    return null;
  } catch {
    return null;
  }
}
