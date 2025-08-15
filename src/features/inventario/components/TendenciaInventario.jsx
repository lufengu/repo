import React from 'react';
import { TrendingDownIcon } from "lucide-react";

const TendenciaInventario = ({ productos = [] }) => {
  // Ordenar productos por ventas ascendente (de menos a más vendidos)
  const productosOrdenados = [...productos].sort((a, b) => (a.ventas ?? 0) - (b.ventas ?? 0));
  // Tomar los 5 menos vendidos
  const menosVendidos = productosOrdenados.slice(0, 5);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8" style={{ backgroundColor: '#FFE5CC', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem' }}>
          <TrendingDownIcon className="w-4 h-4" style={{ color: '#FF6600' }} />
        </div>
        <h2 className="font-semibold text-gray-700">Productos menos vendidos</h2>
      </div>
      <div className="space-y-2">
        {menosVendidos.length === 0 ? (
          <span className="text-gray-500 text-sm">No hay datos de ventas.</span>
        ) : (
          menosVendidos.map((producto, idx) => (
            <div
              key={producto.id || idx}
              className="flex justify-between items-center p-2 border"
              style={{ backgroundColor: '#FFF2E6', borderColor: '#FFE5CC', borderRadius: '0.5rem' }}
            >
              <span className="text-sm text-gray-700 font-medium">{producto.nombre}</span>
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ backgroundColor: '#FFCC99', color: '#FF6600' }}
              >
                {producto.ventas ?? 0} ventas
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TendenciaInventario;