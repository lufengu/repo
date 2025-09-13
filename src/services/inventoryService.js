import api from '../features/auth/services/api';

// Función para obtener todos los productos del inventario
export const getInventory = async () => {
  try {
    const response = await api.get('/inventory/list');
    return response.data;
  } catch (error) {
    console.error('Error en getInventory:', error);
    const message = error.response?.data?.error || 'Error al obtener inventario';
    throw new Error(message);
  }
};

// Función para obtener un producto específico
export const getInventoryItem = async (itemId) => {
  try {
    const response = await api.get(`/inventory/get/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error en getInventoryItem:', error);
    const message = error.response?.data?.error || 'Error al obtener producto';
    throw new Error(message);
  }
};

// Función para crear un nuevo producto
export const createInventoryItem = async (itemData) => {
  try {
    // Mapear los campos del frontend al backend
    const backendData = {
      name: itemData.nombre,
      price: parseFloat(itemData.precio),
      quantity: parseInt(itemData.stock),
      category: itemData.categoria,
      supplierName: itemData.proveedor || 'No especificado',
      presentation: itemData.presentacion || 'N/A',
      expirationDate: itemData.fechaVencimiento || null,
      profitMargin: itemData.precioCompra ? 
        (((parseFloat(itemData.precio) - parseFloat(itemData.precioCompra)) / parseFloat(itemData.precioCompra)) * 100).toFixed(2) 
        : 30.0
    };
    
    const response = await api.post('/inventory/create', backendData);
    return response.data;
  } catch (error) {
    console.error('Error en createInventoryItem:', error);
    const message = error.response?.data?.error || 'Error al crear producto';
    throw new Error(message);
  }
};

// Función para actualizar un producto
export const updateInventoryItem = async (itemId, itemData) => {
  try {
    const backendData = {};
    if (itemData.nombre !== undefined) backendData.name = itemData.nombre;
    if (itemData.precio !== undefined) backendData.price = parseFloat(itemData.precio);
    if (itemData.stock !== undefined) backendData.quantity = parseInt(itemData.stock);
    if (itemData.categoria !== undefined) backendData.category = itemData.categoria;
    if (itemData.proveedor !== undefined) backendData.supplierName = itemData.proveedor;
    if (itemData.presentacion !== undefined) backendData.presentation = itemData.presentacion;
    if (itemData.fechaVencimiento !== undefined) backendData.expirationDate = itemData.fechaVencimiento;
    if (itemData.precioCompra !== undefined && itemData.precio !== undefined) {
      backendData.profitMargin = (((parseFloat(itemData.precio) - parseFloat(itemData.precioCompra)) / parseFloat(itemData.precioCompra)) * 100).toFixed(2);
    }
    
    const response = await api.patch(`/inventory/update/${itemId}`, backendData);
    return response.data;
  } catch (error) {
    console.error('Error en updateInventoryItem:', error);
    const message = error.response?.data?.error || 'Error al actualizar producto';
    throw new Error(message);
  }
};

// Función para eliminar un producto
export const deleteInventoryItem = async (itemId) => {
  try {
    const response = await api.delete(`/inventory/delete/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error en deleteInventoryItem:', error);
    const message = error.response?.data?.error || 'Error al eliminar producto';
    throw new Error(message);
  }
};

// Función para mapear datos del backend al frontend
export const mapBackendToFrontend = (backendItem) => {
  return {
    id: backendItem.id,
    nombre: backendItem.name || 'Sin nombre',
    categoria: backendItem.category || 'Sin categoría',
    precio: parseFloat(backendItem.price) || 0,
    stock: parseInt(backendItem.quantity) || 0,
    proveedor: backendItem.supplier_name || backendItem.supplierName || 'No especificado',
    presentacion: backendItem.presentation || 'N/A',
    fechaVencimiento: backendItem.expiration_date || backendItem.expirationDate || null,
    margenGanancia: parseFloat(backendItem.profit_margin || backendItem.profitMargin) || 30.0,
    unidadMedida: 'und',
    precioCompra: backendItem.profit_margin ? 
      Math.round((parseFloat(backendItem.price) / (1 + (parseFloat(backendItem.profit_margin) / 100))) * 100) / 100
      : Math.round((parseFloat(backendItem.price) || 0) * 0.7 * 100) / 100
  };
};

// Función para mapear datos del frontend al backend
export const mapFrontendToBackend = (frontendItem) => {
  return {
    name: frontendItem.nombre,
    price: parseFloat(frontendItem.precio),
    quantity: parseInt(frontendItem.stock),
    category: frontendItem.categoria
  };
};

// Función para actualizar stock después de una venta
export const updateStockAfterSale = async (ventaItems) => {
  try {
    // Obtener inventario una sola vez
    const inventory = await getInventory();

    const updatePromises = ventaItems.map(async (item) => {
      // item.product puede ser el id o el nombre
      const producto = inventory.find(p => (
        // Comparar id estrictamente o por igualdad débil para cubrir strings/números
        p.id === item.product || p.id == item.product ||
        // Comparar por nombre usando product o productName
        p.name === item.product || p.name === item.productName
      ));

      if (!producto) {
        const idOrName = item.product || item.productName || 'desconocido';
        throw new Error(`Producto ${idOrName} no encontrado en inventario`);
      }

      const newQuantity = producto.quantity - item.quantity;
      if (newQuantity >= 0) {
        return await updateInventoryItem(producto.id, { stock: newQuantity });
      } else {
        throw new Error(`Stock insuficiente para ${producto.name}`);
      }
    });

    await Promise.all(updatePromises);
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    throw new Error(error.message || 'Error al actualizar inventario');
  }
};
