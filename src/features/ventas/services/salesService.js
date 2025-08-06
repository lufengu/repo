import api from '../../auth/services/api';

// Servicio de ventas
export const salesAPI = {
  // Obtener todas las ventas
  getSales: async (page = 1, limit = 10, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      
      const response = await api.get(`/sales?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error en getSales:', error);
      const message = error.response?.data?.message || 'Error al obtener ventas';
      throw new Error(message);
    }
  },

  // Crear una nueva venta
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear venta';
      throw new Error(message);
    }
  },

  // Obtener una venta específica
  getSale: async (saleId) => {
    try {
      const response = await api.get(`/sales/${saleId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener venta';
      throw new Error(message);
    }
  },

  // Actualizar una venta
  updateSale: async (saleId, saleData) => {
    try {
      const response = await api.put(`/sales/${saleId}`, saleData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar venta';
      throw new Error(message);
    }
  },

  // Eliminar una venta
  deleteSale: async (saleId) => {
    try {
      const response = await api.delete(`/sales/${saleId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar venta';
      throw new Error(message);
    }
  },

  // Obtener estadísticas de ventas
  getSalesStats: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });
      
      const response = await api.get(`/sales/stats?${params}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener estadísticas';
      throw new Error(message);
    }
  },

  // Obtener ventas por rango de fechas
  getSalesByDateRange: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      
      const response = await api.get(`/sales/range?${params}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener ventas por fecha';
      throw new Error(message);
    }
  }
};

export default salesAPI;