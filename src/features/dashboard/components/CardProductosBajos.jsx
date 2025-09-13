import React, { useState } from 'react';
import { AlertTriangleIcon } from "lucide-react";
import ModalProductosBajos from './ModalProductosBajos';

const CardProductosBajos = ({ productos = [], onClick = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Obtener productos con stock bajo según el umbral configurado en cada producto
  const productosFiltrados = productos
    .filter(p => typeof p.umbralAlerta === 'number' ? p.stock <= p.umbralAlerta : p.stock < 100)
    .sort((a, b) => a.stock - b.stock);

  const productosCount = productosFiltrados.length;

  const handleOpen = () => {
    setIsOpen(true);
    try { onClick(productosFiltrados); } catch (e) { console.error('onClick handler error:', e); }
  };

  return (
    <>
      <div
        onClick={handleOpen}
        className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-100 w-full max-w-sm"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-50 border border-blue-100">
            <AlertTriangleIcon className="w-4 h-4 text-blue-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-blue-700 leading-tight">¡Atención! Productos por agotarse</h3>
                <p className="text-xs text-gray-500 leading-snug max-w-[16rem] break-words">
                  Haz click para ver todos los productos en riesgo.
                </p>
              </div>
              <div className="ml-2">
                <span className="inline-flex w-24 items-center justify-center bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-1 rounded-full border border-blue-100">{productosCount} en riesgo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de productos (vista previa) */}
        {productosFiltrados.length > 0 ? (
          <div className="flex flex-col gap-2">
            {productosFiltrados.slice(0, 2).map((producto, idx) => (
              <div key={producto.id ?? idx} className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 transition-colors rounded-md p-2 border border-blue-50">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-blue-800 truncate">{producto.nombre || 'Sin nombre'}</div>
                  <div className="text-xs text-blue-600">{producto.categoria || 'Sin categoría'}</div>
                </div>
                <div className="text-xs font-semibold text-blue-700">Stock: <span className="font-bold text-blue-800 ml-1">{producto.stock}</span></div>
              </div>
            ))}
            {productosFiltrados.length > 2 && (
              <div className="text-xs text-gray-500">y {productosFiltrados.length - 2} más...</div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-md border border-gray-100 text-xs text-gray-600">No hay productos con stock bajo.</div>
        )}
      </div>

      {/*lista completa de productos con stock bajo */}
      <ModalProductosBajos isOpen={isOpen} onClose={() => setIsOpen(false)} productos={productosFiltrados} />
    </>
  );
};

export default CardProductosBajos;
