import React, { useState } from 'react';
import { AlertTriangleIcon } from "lucide-react";
import ModalProductosBajos from './ModalProductosBajos';

const CardProductosBajos = ({ productos = [], onClick = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Obtener productos con stock bajo según el umbral configurado en cada producto
  // Ordenar de menor a mayor stock para resaltar los más críticos
  const productosFiltrados = productos
    .filter(p => typeof p.umbralAlerta === 'number' ? p.stock <= p.umbralAlerta : p.stock < 100)
    .sort((a, b) => a.stock - b.stock);
  const productosCount = productosFiltrados.length;
  // Mostrar una vista previa en grid (hasta 2 mini-cards)
  const productosPorPagina = 2;
  const productosStockBajo = productosFiltrados.slice(0, productosPorPagina);

  const handleOpen = () => {
    setIsOpen(true);
    try { onClick(productosFiltrados); } catch (e) { console.error('onClick handler error:', e); }
  };

  return (
    <>
      <div
        onClick={handleOpen}
    className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border-l-4 border-dashed border-white hover:ring-2 hover:ring-gray-100"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); }}
      >
      <div className="flex items-center mb-3">
        <div className="w-9 h-9 rounded flex items-center justify-center mr-3 border border-gray-100 bg-white">
          <AlertTriangleIcon className="w-4 h-4 text-gray-700" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800 leading-tight">Productos por Agotarse</h2>
          <p className="text-xs text-gray-500">Ordenado por menor stock — toca la card para ver la lista completa</p>
        </div>
        <div className="text-xs text-gray-600">{productosCount} requieren atención</div>
      </div>

      {/* Grid de mini-cards por producto */}
      {productosStockBajo.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {productosStockBajo.map(producto => {
            const maxStock = producto.maxStock || producto.stockMax || 100;
            const pct = Math.max(0, Math.min(100, Math.round((producto.stock / maxStock) * 100)));
            return (
              <div key={producto.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{producto.nombre}</div>
                    <div className="text-xs text-gray-500">{producto.categoria || 'Sin categoría'}</div>
                  </div>
                  <div className="flex items-center ml-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold border border-blue-600">{producto.stock}</div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-blue-500 transition-all duration-500 ease-in-out" style={{ width: `${pct}%` }} aria-hidden="true"></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{producto.stock}/{maxStock} ({pct}%)</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-100">
          <span className="text-sm text-gray-600">No hay productos con stock bajo.</span>
        </div>
      )}
      </div>

      {/* Modal que muestra la lista completa de productos con stock bajo */}
      <ModalProductosBajos isOpen={isOpen} onClose={() => setIsOpen(false)} productos={productosFiltrados} />
    </>
  );
};

export default CardProductosBajos;
