import { useState, useEffect } from 'react';
import { 
  getInventory, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  mapBackendToFrontend 
} from '../services/inventoryService';

export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Función para cargar productos desde el backend
  const cargarProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventory();
      const productosFormateados = data.map(item => mapBackendToFrontend(item));
      setProductos(productosFormateados);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar productos:', err);
      // En caso de error, usar productos de respaldo vacío
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  // Función para actualizar productos
  const actualizarProductos = (nuevosProductos) => {
    setProductos(nuevosProductos);
  };

  // Función para agregar producto
  const agregarProducto = async (producto) => {
    setLoading(true);
    setError(null);
    try {
      const nuevoProducto = await createInventoryItem(producto);
      const productoFormateado = mapBackendToFrontend(nuevoProducto);
      setProductos(prev => [...prev, productoFormateado]);
      return productoFormateado;
    } catch (err) {
      setError(err.message);
      console.error('Error al agregar producto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar producto
  const eliminarProducto = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteInventoryItem(id);
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar producto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para editar producto
  const editarProducto = async (id, datosActualizados) => {
    setLoading(true);
    setError(null);
    try {
      const productoActualizado = await updateInventoryItem(id, datosActualizados);
      const productoFormateado = mapBackendToFrontend(productoActualizado);
      setProductos(prev => prev.map(p => 
        p.id === id ? productoFormateado : p
      ));
      return productoFormateado;
    } catch (err) {
      setError(err.message);
      console.error('Error al editar producto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    productos,
    loading,
    error,
    actualizarProductos,
    agregarProducto,
    eliminarProducto,
    editarProducto,
    cargarProductos
  };
};