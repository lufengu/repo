import { DollarSignIcon, RefreshCwIcon } from "lucide-react";
import { useVentasDelDia } from "../../../hooks/useVentasDelDia";

const CardVentasDia = () => {
  const { totalVentas, cantidadVentas, loading, error, refresh } = useVentasDelDia();

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleRefresh = () => {
    refresh();
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <DollarSignIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-700">Ventas del Día</h2>
          </div>
          <RefreshCwIcon className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
              <DollarSignIcon className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="font-semibold text-gray-700">Ventas del Día</h2>
          </div>
          <button 
            onClick={handleRefresh}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Reintentar"
          >
            <RefreshCwIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <DollarSignIcon className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="font-semibold text-gray-700">Ventas del Día</h2>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Actualizar"
        >
          <RefreshCwIcon className="w-4 h-4 text-gray-600 hover:text-blue-600" />
        </button>
      </div>
      <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalVentas)}</p>
      <p className="text-sm text-gray-500">
        {cantidadVentas} {cantidadVentas === 1 ? 'venta realizada' : 'ventas realizadas'} hoy
      </p>
    </div>
  );
};

export default CardVentasDia;
