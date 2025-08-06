import React from 'react';
import { TrendingUpIcon } from "lucide-react";

const TendenciaInventario = ({ productos = [] }) => {
  const totalProductos = productos.length;
  const stockTotal = productos.reduce((sum, p) => sum + p.stock, 0);
  const promedioStock = totalProductos > 0 ? (stockTotal / totalProductos).toFixed(1) : 0;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <TrendingUpIcon className="w-4 h-4 text-green-600" />
        </div>
        <h2 className="font-semibold text-gray-700">Tendencia de inventario</h2>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-100">
          <span className="text-sm text-gray-700 font-medium">Total productos</span>
          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">{totalProductos}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-100">
          <span className="text-sm text-gray-700 font-medium">Stock total</span>
          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">{stockTotal}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-100">
          <span className="text-sm text-gray-700 font-medium">Promedio stock</span>
          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">{promedioStock}</span>
        </div>
        
        {/* Barra de progreso visual */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="h-3 bg-green-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(promedioStock * 10, 100)}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Nivel de stock promedio</span>
        </div>
      </div>
    </div>
  );
};

export default TendenciaInventario;