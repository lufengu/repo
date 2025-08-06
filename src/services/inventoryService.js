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
      category: itemData.categoria
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
    // Mapear los campos del frontend al backend
    const backendData = {};
    if (itemData.nombre !== undefined) backendData.name = itemData.nombre;
    if (itemData.precio !== undefined) backendData.price = parseFloat(itemData.precio);
    if (itemData.stock !== undefined) backendData.quantity = parseInt(itemData.stock);
    if (itemData.categoria !== undefined) backendData.category = itemData.categoria;
    
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
    // Campos adicionales con valores por defecto para mantener compatibilidad
    unidadMedida: 'und',
    presentacion: 'N/A',
    proveedor: 'No especificado',
    fechaVencimiento: '2025-12-31', // Fecha por defecto en el futuro
    precioCompra: Math.round((parseFloat(backendItem.price) || 0) * 0.7), // Estimación del 70%
    margenGanancia: 30.0 // Valor por defecto
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
