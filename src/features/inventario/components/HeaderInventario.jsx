import React from 'react';
import { FaBell } from 'react-icons/fa';

const HeaderInventario = ({ productosStockBajo, onVerProductosBajos }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        📦 Inventario
      </h2>
      
      {productosStockBajo > 0 && (
        <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <FaBell className="text-red-500" />
          <span className="text-red-700 text-sm font-medium">
            {productosStockBajo} producto{productosStockBajo > 1 ? 's' : ''} con stock mínimo
          </span>
          <button 
            onClick={onVerProductosBajos}
            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
          >
            Ver
          </button>
        </div>
      )}
    </div>
  );
};

export default HeaderInventario;