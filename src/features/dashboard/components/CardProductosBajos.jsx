import React from 'react';
import { AlertTriangleIcon } from "lucide-react";

const CardProductosBajos = ({ productos = [] }) => {
  // Obtener productos con stock bajo (menos de 5)
  const productosStockBajo = productos
    .filter(p => p.stock < 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 3);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
          <AlertTriangleIcon className="w-4 h-4 text-red-600" />
        </div>
        <h2 className="font-semibold text-gray-700">Productos por Agotarse</h2>
      </div>
      
      {/* Lista de productos con stock bajo */}
      <div className="space-y-2">
        {productosStockBajo.length > 0 ? (
          productosStockBajo.map(producto => (
            <div key={producto.id} className="flex justify-between items-center p-2 bg-red-50 rounded-lg border border-red-100">
              <span className="text-sm text-gray-700 font-medium">{producto.nombre}</span>
              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-semibold">
                {producto.stock} unidades
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-100">
            <span className="text-green-700 text-sm font-medium">✓ Todos los productos tienen stock suficiente</span>
          </div>
        )}
      </div>
      
      {/* Indicador de total */}
      {productosStockBajo.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {productos.filter(p => p.stock < 5).length} producto(s) requieren atención
          </span>
        </div>
      )}
    </div>
  );
};

export default CardProductosBajos;
