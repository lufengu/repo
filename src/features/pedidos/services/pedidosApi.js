import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const pedidosApi = {
  getPedidos: async () => {
    const res = await axios.get(`${API_URL}/api/pedidos`);
    return res.data;
  },
  createPedido: async (pedido) => {
    const res = await axios.post(`${API_URL}/api/pedidos`, pedido);
    return res.data;
  },
  deletePedido: async (id) => {
    const res = await axios.delete(`${API_URL}/api/pedidos/${id}`);
    return res.data;
  },
  updatePedido: async (id, data) => {
    const res = await axios.put(`${API_URL}/api/pedidos/${id}`, data);
    return res.data;
  }
};

export default pedidosApi;
