import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PaginacionInventario = ({
  paginaActual,
  totalPaginas,
  indiceInicio,
  indiceFin,
  totalProductos,
  categoriaFiltro,
  irAPaginaAnterior,
  irAPaginaSiguiente
}) => {
  if (totalProductos === 0) return null;

  return (
    <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-600 text-center sm:text-left">
        Mostrando {indiceInicio + 1} a {Math.min(indiceFin, totalProductos)} de {totalProductos} productos
        {categoriaFiltro !== 'Todas' && (
          <span className="ml-2 text-blue-600 font-medium">
            (filtrado por: {categoriaFiltro})
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={irAPaginaAnterior}
          disabled={paginaActual === 1}
          className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
            paginaActual === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <FaChevronLeft size={12} />
          Anterior
        </button>

        <span className="px-3 py-1 text-sm text-gray-600 bg-white rounded border">
          Página {paginaActual} de {totalPaginas}
        </span>

        <button
          onClick={irAPaginaSiguiente}
          disabled={paginaActual === totalPaginas}
          className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
            paginaActual === totalPaginas
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Siguiente
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default PaginacionInventario;