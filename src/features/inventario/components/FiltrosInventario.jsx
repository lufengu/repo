import React from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';

const FiltrosInventario = ({
  busqueda,
  setBusqueda,
  productosPorPagina,
  setProductosPorPagina,
  setPaginaActual,
  onAgregarProducto
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
      <div className="flex items-center gap-4">
        {/* Buscador */}
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded w-full max-w-md">
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            className="bg-transparent outline-none w-full"
            placeholder="Buscar producto"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Selector de productos por página */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar:</span>
          <select
            value={productosPorPagina}
            onChange={(e) => {
              setProductosPorPagina(Number(e.target.value));
              setPaginaActual(1);
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Botón agregar */}
      <button 
        onClick={onAgregarProducto}
        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto hover:bg-blue-600 transition-colors"
      >
        <FaPlus /> Añadir producto
      </button>
    </div>
  );
};

export default FiltrosInventario;