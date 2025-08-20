import React from 'react';
import { AlertTriangleIcon } from "lucide-react";

const CardProductosBajos = ({ productos = [] }) => {
  // Obtener productos con stock bajo según el umbral configurado en cada producto
  const [paginaActual, setPaginaActual] = React.useState(1);
  const productosPorPagina = 2;
  const productosFiltrados = productos
    .filter(p => typeof p.umbralAlerta === 'number' ? p.stock <= p.umbralAlerta : p.stock < 100)
    .sort((a, b) => a.stock - b.stock);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosStockBajo = productosFiltrados.slice(indiceInicio, indiceFin);

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
        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center mt-2 gap-2">
            <button
              className={`px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold ${paginaActual === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
            >Anterior</button>
            <span className="text-xs text-gray-500">Página {paginaActual} de {totalPaginas}</span>
            <button
              className={`px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold ${paginaActual === totalPaginas ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
            >Siguiente</button>
          </div>
        )}
      </div>
      
      {/* Indicador de total */}
      {productosStockBajo.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {productos.filter(p => typeof p.umbralAlerta === 'number' ? p.stock <= p.umbralAlerta : p.stock < 5).length} producto(s) requieren atención
          </span>
        </div>
      )}
    </div>
  );
};

export default CardProductosBajos;
