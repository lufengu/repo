import React, { useEffect } from 'react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4">
  <div className="bg-white rounded-lg shadow-2xl w-full p-5 transform transition-all duration-200 ease-out scale-100" style={{ maxWidth: '60.2rem', maxHeight: '70vh' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <IconBox />
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
  {/* Mostrar exactamente 3 filas y activar scroll si hay más */}
        <div
          className="divide-y divide-gray-100 overflow-y-auto custom-scrollbar"
          style={{ maxHeight: 'calc(70vh - 160px)' }}
          onWheel={(e) => {
            // Mejorar la sensibilidad del scroll: multiplicador ajustable
            const SPEED = 2.5; // mayor = scroll más rápido
            e.preventDefault();
            const container = e.currentTarget;
            // usar deltaY para desplazar
            container.scrollTop += e.deltaY * SPEED;
          }}
        >
          {productos.length > 0 ? (
            productos.map(p => {
              const maxStock = p.maxStock || p.stockMax || 100;
              const pct = Math.max(0, Math.min(100, Math.round((p.stock / maxStock) * 100)));
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 py-3 px-3 hover:bg-red-50 rounded-md transition-colors min-h-[64px]"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-white border border-red-100 rounded-md flex items-center justify-center">
                      <IconBox />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{p.nombre}</div>
                      <div className="text-xs text-gray-500">{p.categoria || 'Sin categoría'}</div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className="h-2 bg-amber-500" style={{ width: `${pct}%` }} aria-hidden="true"></div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">{p.stock}/{maxStock} ({pct}%)</div>
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
