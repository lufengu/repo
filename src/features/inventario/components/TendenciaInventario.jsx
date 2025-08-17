import React from 'react';
import { TrendingUpIcon } from "lucide-react";

const UMBRAL = 10; // Cambia a 1 para pruebas

const TendenciaInventario = ({ productos = [] }) => {
  // Filtra productos de baja rotación o ventas
  const productosFiltrados = productos.filter(p => {
    if (typeof p.ventas === 'number') return p.ventas <= UMBRAL;
    if (typeof p.rotacion === 'number') return p.rotacion <= UMBRAL;
    return p.stock > 0;
  });

  // Ordena por menor ventas/rotación o mayor stock
  const productosMenosVendidos = productosFiltrados
    .sort((a, b) => {
      if (typeof a.ventas === 'number' && typeof b.ventas === 'number') return a.ventas - b.ventas;
      if (typeof a.rotacion === 'number' && typeof b.rotacion === 'number') return a.rotacion - b.rotacion;
      return b.stock - a.stock;
    })
    .slice(0, 3);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
          <TrendingUpIcon className="w-4 h-4 text-red-600" />
        </div>
        <h2 className="font-semibold text-gray-700">Productos menos vendidos</h2>
      </div>
      <div className="space-y-2">
        {productosMenosVendidos.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">No hay datos de productos</div>
        ) : (
          <ul className="divide-y divide-red-100">
            {productosMenosVendidos.map((p, idx) => (
              <li key={p.id || idx} className="flex justify-between items-center py-2 px-2 bg-red-50 rounded-lg mb-2">
                <span className="text-sm text-gray-700 font-medium truncate max-w-[120px]">{p.nombre || p.name || 'Producto'}</span>
                <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-semibold">
                  {typeof p.ventas === 'number'
                    ? `Ventas: ${p.ventas}`
                    : typeof p.rotacion === 'number'
                    ? `Rotación: ${p.rotacion}`
                    : `Stock: ${p.stock}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TendenciaInventario;