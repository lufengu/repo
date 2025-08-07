import { useState, useEffect, useCallback } from 'react';
import { salesAPI } from '../features/ventas/services/salesService';

export const useVentasDelDia = (refreshInterval = 300000) => { // 5 minutos por defecto
  const [ventasDelDia, setVentasDelDia] = useState({
    totalVentas: 0,
    cantidadVentas: 0,
    loading: true,
    error: null
  });

  const fetchVentasDelDia = useCallback(async () => {
    try {
      setVentasDelDia(prev => ({ ...prev, loading: true, error: null }));
      
      // Obtener todas las ventas
      const ventas = await salesAPI.getSales();
      
      // Filtrar ventas del día actual
      const hoy = new Date().toISOString().split('T')[0];
      const ventasHoy = ventas.filter(venta => {
        const fechaVenta = new Date(venta.createdAt).toISOString().split('T')[0];
        return fechaVenta === hoy;
      });
      
      // Calcular el total de ventas del día
      const totalVentas = ventasHoy.reduce((suma, venta) => {
        return suma + (venta.total || 0);
      }, 0);
      
      // Cantidad de ventas realizadas
      const cantidadVentas = ventasHoy.length;
      
      setVentasDelDia({
        totalVentas,
        cantidadVentas,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error al obtener ventas del día:', error);
      setVentasDelDia(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar las ventas del día'
      }));
    }
  }, []);

  useEffect(() => {
    // Cargar datos inicialmente
    fetchVentasDelDia();

    // Configurar actualización automática si se especifica un intervalo
    let intervalId;
    if (refreshInterval > 0) {
      intervalId = setInterval(fetchVentasDelDia, refreshInterval);
    }

    // Limpiar el intervalo al desmontar el componente
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchVentasDelDia, refreshInterval]);

  // Escuchar eventos personalizados de actualización de ventas
  useEffect(() => {
    const handleVentaCreated = () => {
      fetchVentasDelDia();
    };

    const handleVentaUpdated = () => {
      fetchVentasDelDia();
    };

    // Agregar listeners para eventos personalizados
    window.addEventListener('ventaCreated', handleVentaCreated);
    window.addEventListener('ventaUpdated', handleVentaUpdated);

    return () => {
      window.removeEventListener('ventaCreated', handleVentaCreated);
      window.removeEventListener('ventaUpdated', handleVentaUpdated);
    };
  }, [fetchVentasDelDia]);

  return {
    ...ventasDelDia,
    refresh: fetchVentasDelDia
  };
};
