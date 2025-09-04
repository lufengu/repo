import api from '../../auth/services/api';

// Función para mapear datos del backend al frontend
const mapBackendToFrontend = (backendSale) => {
  // Calcular total de items desde el campo amount si está disponible, 
  // sino calcularlo desde el campo products
  let totalItems = 0;
  if (backendSale.amount && backendSale.amount > 0) {
    totalItems = parseInt(backendSale.amount);
  } else if (backendSale.products) {
    try {
      const products = JSON.parse(backendSale.products);
      totalItems = products.reduce((sum, item) => sum + (item.quantity || 0), 0);
    } catch {
      totalItems = 0;
    }
  }

  return {
    id: backendSale.id,
    date: backendSale.date,
  customer: backendSale.customer || 'Cliente General',
  cedula: backendSale.cedula || backendSale.customerCedula || backendSale.customerDocument || backendSale.document || backendSale.dni || backendSale.documento || '',
  direccion: backendSale.direccion || backendSale.customerAddress || backendSale.address || backendSale.customerDireccion || backendSale.direccionFiscal || backendSale.direccion_fiscal || '',
  phone: '', // No disponible en backend actual
  email: backendSale.customerEmail || '',
    items: backendSale.products ? JSON.parse(backendSale.products) : [],
    payment_method: backendSale.paymentMethod,
    paymentMethod: backendSale.paymentMethod, // Para compatibilidad
    total: parseFloat(backendSale.total) || 0,
    totalItems: totalItems,
    createdAt: backendSale.date ? new Date(backendSale.date).toISOString() : new Date().toISOString(),
    userId: backendSale.userId
  };
};

// Servicio de ventas - actualizado para backend real
export const salesAPI = {
  // Obtener todas las ventas del usuario autenticado
  getSales: async () => {
    try {
      const response = await api.get('/sales/list');
      // Mapear datos del backend al formato del frontend
      const mappedSales = response.data.map(sale => mapBackendToFrontend(sale));
      // Ordenar por ID descendente para mostrar las más recientes primero
      const sortedSales = mappedSales.sort((a, b) => b.id - a.id);
      return sortedSales;
    } catch (error) {
      console.error('Error en getSales:', error);
      const message = error.response?.data?.error || 'Error al obtener ventas';
      throw new Error(message);
    }
  },

  // Crear una nueva venta
  createSale: async (saleData) => {
    try {
      // Calcular la cantidad total de productos
      const totalQuantity = saleData.items ? saleData.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
      
      // Mapear datos del frontend al formato del backend
      const cedulaValue = saleData.cedula || saleData.customer?.cedula || saleData.customerCedula || '';
      const direccionValue = saleData.direccion || saleData.customer?.direccion || saleData.customerAddress || '';
      const backendData = {
        date: saleData.date || new Date().toISOString().split('T')[0],
        customer: saleData.customer || 'Cliente General',
        customerEmail: saleData.email || '',
        cedula: cedulaValue,
        dni: String(cedulaValue),
        direccion: direccionValue,
        address: String(direccionValue),
        products: JSON.stringify(saleData.items || []), // El backend espera JSON string
        paymentMethod: saleData.payment_method || saleData.paymentMethod,
        total: parseFloat(saleData.total),
        amount: totalQuantity // Cantidad total de productos vendidos
      };
      
      const response = await api.post('/sales/create', backendData);
      
      // Disparar evento personalizado para notificar que se creó una nueva venta
      window.dispatchEvent(new CustomEvent('ventaCreated', { 
        detail: response.data 
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error en createSale:', error);
      const message = error.response?.data?.error || 'Error al crear venta';
      throw new Error(message);
    }
  },

  // Obtener una venta específica
  getSale: async (saleId) => {
    try {
  const response = await api.get(`/sales/get/${saleId}`);
  return mapBackendToFrontend(response.data);
    } catch (error) {
      const message = error.response?.data?.error || 'Error al obtener venta';
      throw new Error(message);
    }
  },

  // Actualizar una venta
  updateSale: async (saleId, saleData) => {
    try {
      // Calcular la cantidad total de productos
      const totalQuantity = saleData.items ? saleData.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
      
      // Mapear datos del frontend al formato del backend
      const backendData = {
        date: saleData.date,
        customer: saleData.customer,
        customerEmail: saleData.email,
  cedula: saleData.cedula || saleData.customer?.cedula || saleData.customerCedula || '',
  direccion: saleData.direccion || saleData.customer?.direccion || saleData.customerAddress || '',
        products: typeof saleData.items === 'string' ? saleData.items : JSON.stringify(saleData.items || []),
        paymentMethod: saleData.payment_method || saleData.paymentMethod,
        total: parseFloat(saleData.total),
        amount: totalQuantity // Cantidad total de productos vendidos
      };
      
      const response = await api.patch(`/sales/update/${saleId}`, backendData);
      
      // Disparar evento personalizado para notificar que se actualizó una venta
      window.dispatchEvent(new CustomEvent('ventaUpdated', { 
        detail: response.data 
      }));
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar venta';
      throw new Error(message);
    }
  },

  // Eliminar una venta
  deleteSale: async (saleId) => {
    try {
      const response = await api.delete(`/sales/delete/${saleId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al eliminar venta';
      throw new Error(message);
    }
  },

  // Nuevos métodos para estadísticas de cantidad
  
  // Obtener estadísticas totales de cantidad vendida
  getTotalQuantityStats: async () => {
    try {
      const response = await api.get('/sales/stats/total-quantity');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al obtener estadísticas de cantidad';
      throw new Error(message);
    }
  },

  // Obtener estadísticas por producto
  getProductStats: async () => {
    try {
      const response = await api.get('/sales/stats/products');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al obtener estadísticas de productos';
      throw new Error(message);
    }
  },

  // Obtener estadísticas por período
  getSalesStatsByPeriod: async (startDate, endDate) => {
    try {
      const response = await api.get(`/sales/stats/period?start=${startDate}&end=${endDate}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al obtener estadísticas por período';
      throw new Error(message);
    }
  },

  // Referencia a la función de mapeo externa
  mapBackendToFrontend
};

export default salesAPI;