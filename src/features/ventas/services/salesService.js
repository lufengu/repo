import api from '../../auth/services/api';

// Función para mapear datos del backend al frontend
const mapBackendToFrontend = (backendSale) => {
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
  phone: '', 
  email: backendSale.customerEmail || '',
    items: backendSale.products ? JSON.parse(backendSale.products) : [],
    payment_method: backendSale.paymentMethod,
    paymentMethod: backendSale.paymentMethod, 
    total: parseFloat(backendSale.total) || 0,
    totalItems: totalItems,
    createdAt: backendSale.date ? new Date(backendSale.date).toISOString() : new Date().toISOString(),
    userId: backendSale.userId
  };
};

// Servicio de ventas - actualizado para backend real
export const salesAPI = {
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
        products: JSON.stringify(saleData.items || []), 
        paymentMethod: saleData.payment_method || saleData.paymentMethod,
        total: parseFloat(saleData.total),
        amount: totalQuantity 
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

// Función para propagar un cambio de nombre de producto en las ventas/historial
export const updateProductNameInSales = async (productId, newName) => {
  try {
    // Obtener todas las ventas (mapeadas al formato frontend)
    const sales = await salesAPI.getSales();

    const updatePromises = sales.map(async (sale) => {
      if (!sale.items || !Array.isArray(sale.items)) return null;

      let changed = false;
      const updatedItems = sale.items.map(item => {
        // item.product puede ser id (num o string) o nombre; comparamos por id estricto o débil
        const matches = item.product === productId || item.product == productId || String(item.product) === String(productId);
        if (matches) {
          changed = true;
          return { ...item, productName: newName, name: newName };
        }
        return item;
      });

      if (changed) {
        // Construir payload compatible con updateSale
        const saleData = {
          date: sale.date,
          customer: sale.customer,
          email: sale.email,
          cedula: sale.cedula,
          direccion: sale.direccion,
          items: updatedItems,
          payment_method: sale.payment_method || sale.paymentMethod,
          total: sale.total
        };

        try {
          await salesAPI.updateSale(sale.id, saleData);
        } catch (err) {
          console.error(`Error actualizando venta ${sale.id} al propagar nombre del producto:`, err);
        }
      }

      return null;
    });

    await Promise.all(updatePromises);
    return { success: true };
  } catch (error) {
    console.error('Error en updateProductNameInSales:', error);
    throw error;
  }
};