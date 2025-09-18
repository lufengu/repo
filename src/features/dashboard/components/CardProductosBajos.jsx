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
  const limitePreview = 2;
  const restantes = productosCount - limitePreview;

  const handleOpen = () => {
    setIsOpen(true);
    try { onClick(productosFiltrados); } catch (e) { console.error('onClick handler error:', e); }
  };

  return (
    <>
      <div
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        aria-label={`Abrir listado de ${productosCount} producto${productosCount !== 1 ? 's' : ''} con stock bajo`}
        className="
          w-full
          bg-white p-4 rounded-2xl
          shadow-md hover:shadow-lg
          transition-all duration-200 cursor-pointer
          border border-gray-100
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
          active:scale-[.985]
        "
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); }}
      >
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 border border-blue-100 shrink-0">
            <AlertTriangleIcon className="w-5 h-5 text-blue-600" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-[12rem]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-blue-700 leading-tight">
                  ¡Atención! Productos por agotarse
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-500 leading-snug max-w-full sm:max-w-[20rem]">
                  Haz clic para ver todos los productos en riesgo.
                </p>
              </div>
              <span className="
                inline-flex items-center justify-center
                bg-blue-50 text-blue-700
                text-[11px] sm:text-xs font-medium
                px-3 py-1 rounded-full border border-blue-100
                self-start
              ">
                {productosCount} en riesgo
              </span>
            </div>
          </div>
        </div>

        {/* Vista previa (solo 2 productos) */}
        {productosFiltrados.length > 0 ? (
          <div className="grid gap-2 grid-cols-1 xs:grid-cols-2 md:grid-cols-2">
            {productosFiltrados.slice(0, limitePreview).map((producto, idx) => (
              <div
                key={producto.id ?? idx}
                className="flex items-center justify-between gap-3
                           bg-blue-50 hover:bg-blue-100
                           transition-colors rounded-lg p-2.5
                           border border-blue-100
                           min-w-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-blue-800 truncate">
                    {producto.nombre || 'Sin nombre'}
                  </div>
                  <div className="text-[11px] text-blue-600 truncate">
                    {producto.categoria || 'Sin categoría'}
                  </div>
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-blue-700 shrink-0">
                  Stock:
                  <span className="font-bold text-blue-800 ml-1">
                    {producto.stock}
                  </span>
                </div>
              </div>
            ))}
            {restantes > 0 && (
              <div className="col-span-full text-[11px] text-gray-500">
                y {restantes} más...
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600">
            No hay productos con stock bajo.
          </div>
        )}
      </div>

      <ModalProductosBajos
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productos={productosFiltrados}
      />
    </>
  );
};

export default CardProductosBajos;
