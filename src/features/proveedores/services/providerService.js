// Servicio para consumir la API de proveedores
import api from '../../auth/services/api';

const API_URL = '/providers';

export const getProviders = async () => {
  const res = await api.get(`${API_URL}/list`);
  return res.data;
};

export const createProvider = async (data) => {
  const res = await api.post(`${API_URL}/create`, data);
  return res.data;
};

export const deleteProvider = async (id) => {
  const res = await api.delete(`${API_URL}/delete/${id}`);
  return res.data;
};

export const updateProvider = async (id, data) => {
  const res = await api.patch(`${API_URL}/update/${id}`, data);
  return res.data;
};
