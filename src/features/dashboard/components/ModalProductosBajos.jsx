import React, { useEffect } from 'react';
import logoCompleto from '../../../assets/logoCompleto.png';
// ...existing code...

const IconBox = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-600">
    <path d="M3 7.5L12 3l9 4.5v7L12 21 3 14.5v-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3v18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = ({ className = '' }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Helpers locales (no archivos nuevos)
const getCapacity = (p) => {
  // Buscar campos comunes que indiquen capacidad/total inicial
  if (!p) return null;
  return (typeof p.maxStock === 'number' ? p.maxStock
    : typeof p.stockMax === 'number' ? p.stockMax
    : typeof p.cantidadTotal === 'number' ? p.cantidadTotal
    : typeof p.total === 'number' ? p.total
    : typeof p.inventoryTotal === 'number' ? p.inventoryTotal
    : typeof p.capacidad === 'number' ? p.capacidad
    : null);
};

const getStockPct = (p) => {
  if (!p || typeof p.stock !== 'number') return null;
  const cap = getCapacity(p);
  if (typeof cap === 'number' && cap > 0) {
    return Math.max(0, Math.min(100, Math.round((p.stock / cap) * 100)));
  }
  return null;
};

const ModalProductosBajos = ({ isOpen, onClose, productos = [] }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Cálculo de resumen global
  const totalStock = productos.reduce((s, p) => s + (Number(p.stock) || 0), 0);
  const totalCapacity = productos.reduce((s, p) => {
    const c = getCapacity(p);
    return s + (typeof c === 'number' ? c : 0);
  }, 0);
  const overallPct = (totalCapacity > 0) ? Math.max(0, Math.min(100, Math.round((totalStock / totalCapacity) * 100))) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-lg shadow-2xl w-full p-5 transform transition-all duration-200 ease-out scale-100" style={{ maxWidth: '60.2rem', maxHeight: '70vh' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={logoCompleto} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Productos por Agotarse</h3>
              <p className="text-sm text-gray-500">Lista de artículos que requieren atención por bajo stock.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Scroll personalizado para la lista */}
        <style>
          {`.custom-scrollbar::-webkit-scrollbar{width:10px}
            .custom-scrollbar::-webkit-scrollbar-track{background:transparent}
            .custom-scrollbar::-webkit-scrollbar-thumb{background:#FEE2E2;border-radius:8px}
            .custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#FCA5A5}
          `}
        </style>

        {/* Resumen global (barra o total) */}
        <div className="mb-4">
          {overallPct !== null ? (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">Inventario total</div>
                <div className="text-sm text-gray-600 font-medium">{totalStock}/{totalCapacity} ({overallPct}%)</div>
              </div>
              <div className="relative w-full rounded-full h-4 overflow-hidden bg-orange-100">
                <div
                  className="absolute left-0 top-0 h-full bg-orange-500"
                  style={{ width: `${overallPct}%` }}
                  aria-hidden="true"
                />
                <div className={`absolute inset-0 flex items-center justify-center text-sm font-semibold ${overallPct >= 25 ? 'text-white' : 'text-gray-700'}`}>
                  {totalStock}/{totalCapacity} ({overallPct}%)
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Total unidades: {totalStock}</div>
          )}
        </div>

        {/* Mostrar exactamente 3 filas y activar scroll si hay más */}
        <div
          className="divide-y divide-gray-100 overflow-y-auto custom-scrollbar"
          style={{ maxHeight: 'calc(70vh - 220px)' }}
          onWheel={(e) => {
            const SPEED = 2.5;
            e.preventDefault();
            const container = e.currentTarget;
            container.scrollTop += e.deltaY * SPEED;
          }}
        >
          {productos.length > 0 ? (
            productos.map(p => {
              const maxStock = getCapacity(p);
              const pct = getStockPct(p);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 py-3 px-3 hover:bg-red-50 rounded-md transition-colors min-h-[64px]"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-white border border-red-100 rounded-md flex items-center justify-center overflow-hidden">
                      <img src={logoCompleto} alt="logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{p.nombre}</div>
                      <div className="text-xs text-gray-500">{p.categoria || 'Sin categoría'}</div>
                      <div className="mt-2">
                        <div className="relative w-full rounded-full h-6 overflow-hidden bg-orange-100">
                          <div
                            className="absolute left-0 top-0 h-full bg-orange-500"
                            style={{ width: `${pct ?? 0}%` }}
                            aria-hidden="true"
                          />
                          <div className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${pct !== null && pct >= 25 ? 'text-white' : 'text-gray-700'}`}>
                            {maxStock ? `${p.stock}/${maxStock} (${pct ?? 0}%)` : `${p.stock} und`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 flex items-center justify-center text-sm font-semibold rounded-md bg-red-100 text-red-800 border border-red-100">{p.stock} und</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-600">No hay productos con stock bajo.</div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalProductosBajos;
