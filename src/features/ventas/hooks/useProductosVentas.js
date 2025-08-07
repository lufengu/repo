import { useState, useEffect } from 'react';
import { getInventory, mapBackendToFrontend } from '../../../services/inventoryService';

export const useProductosVentas = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Función para cargar productos disponibles para venta
  const cargarProductosParaVenta = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventory();
      const productosFormateados = data
        .map(item => mapBackendToFrontend(item))
        .filter(producto => producto.stock > 0) // Solo productos con stock
        .map(producto => ({
          id: producto.id,
          name: producto.nombre,
          price: producto.precio,
          stock: producto.stock,
          category: producto.categoria,
          unidadMedida: producto.unidadMedida || 'und',
          // Para compatibilidad con el componente existente
          suggestedPrice: producto.precio
        }));
      
      setProductos(productosFormateados);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar productos para venta:', err);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar stock disponible
  const verificarStock = (productoId, cantidadSolicitada) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
      return { disponible: false, mensaje: 'Producto no encontrado' };
    }
    
    if (cantidadSolicitada > producto.stock) {
      return { 
        disponible: false, 
        mensaje: `Stock insuficiente. Disponible: ${producto.stock} ${producto.unidadMedida}` 
      };
    }
    
    return { disponible: true, mensaje: '' };
  };

  // Función para obtener un producto por nombre
  const obtenerProductoPorNombre = (nombre) => {
    return productos.find(p => p.name === nombre);
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductosParaVenta();
  }, []);

  return {
    productos,
    loading,
    error,
    cargarProductosParaVenta,
    verificarStock,
    obtenerProductoPorNombre
  };
};
