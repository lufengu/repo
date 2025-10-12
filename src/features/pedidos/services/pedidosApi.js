import axios from 'axios';
import { API_BASE } from '../../../config/settings';

const API_URL = import.meta.env.VITE_API_URL || API_BASE;

function getAuthHeader() {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const pedidosApi = {
  getPedidos: async () => {
    const res = await axios.get(`${API_URL}/api/orders/list`, {
      headers: getAuthHeader()
    });
    return res.data;
  },
  getPedido: async (id) => {
    const res = await axios.get(`${API_URL}/api/orders/get/${id}`, {
      headers: getAuthHeader()
    });
    return res.data;
  },
  createPedido: async (pedido) => {
    const res = await axios.post(`${API_URL}/api/orders/create`, pedido, {
      headers: getAuthHeader()
    });
    return res.data;
  },
  deletePedido: async (id) => {
    const res = await axios.delete(`${API_URL}/api/orders/delete/${id}`, {
      headers: getAuthHeader()
    });
    return res.data;
  },
  updatePedido: async (id, data) => {
    const res = await axios.patch(`${API_URL}/api/orders/update/${id}`, data, {
      headers: getAuthHeader()
    });
    return res.data;
  }
};

export default pedidosApi;
