import React, { useState, useEffect } from 'react';
import { FaBoxes, FaShoppingCart, FaChartLine } from 'react-icons/fa';
import { salesAPI } from '../../ventas/services/salesService';

const CardTotalCantidadVendida = () => {
  const [stats, setStats] = useState({
    totalQuantitySold: 0,
    totalSales: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await salesAPI.getTotalQuantityStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar estadísticas de cantidad:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-CO').format(num);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Total Productos Vendidos
            </h3>
            <p className="text-sm text-red-600">Error: {error}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <FaBoxes className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
              <FaBoxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Total Productos Vendidos
              </h3>
              <p className="text-sm text-gray-600">
                Cantidad total de unidades
              </p>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        {loading ? (
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cantidad total */}
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-blue-600">
                  {formatNumber(stats.totalQuantitySold)}
                </span>
                <span className="text-sm text-gray-600 font-medium">
                  unidades
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Total de productos vendidos
              </p>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-200"></div>

            {/* Métricas adicionales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <FaShoppingCart className="w-4 h-4 text-green-500" />
                  <span className="text-lg font-semibold text-gray-800">
                    {formatNumber(stats.totalSales)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Ventas realizadas
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <FaChartLine className="w-4 h-4 text-purple-500" />
                  <span className="text-lg font-semibold text-gray-800">
                    {stats.totalSales > 0 ? 
                      formatNumber(Math.round(stats.totalQuantitySold / stats.totalSales)) : 
                      '0'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Promedio por venta
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer con indicador de actualización */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Actualizado: {new Date().toLocaleDateString('es-CO')}
            </p>
            <button
              onClick={loadStats}
              disabled={loading}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardTotalCantidadVendida;
