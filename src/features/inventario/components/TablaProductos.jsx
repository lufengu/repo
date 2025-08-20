import React from 'react';
import { FaFilter, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const TablaProductos = ({
  productosActuales,
  categorias,
  categoriaFiltro,
  setCategoriaFiltro,
  onEditarProducto,
  onEliminarProducto,
  onLimpiarFiltros
}) => {
  const formatearUnidad = (unidad) => {
    const unidades = {
      'kg': 'Kilogramo',
      'g': 'Gramo',
      'lt': 'Litro',
      'ml': 'Mililitro',
      'und': 'Unidad',
      'lb': 'Libra',
      'oz': 'Onza',
      'pqt': 'Paquete',
      'cj': 'Caja',
      'bot': 'Botella'
    };
    return unidades[unidad] || unidad;
  };

  const calcularDiasVencimiento = (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  const getEstadoVencimiento = (dias) => {
    if (dias <= 7) return { color: 'bg-red-100 text-red-800', texto: 'Próximo a vencer' };
    if (dias <= 30) return { color: 'bg-yellow-100 text-yellow-800', texto: 'Vigente' };
    return { color: 'bg-green-100 text-green-800', texto: 'Vigente' };
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span>Categoría</span>
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="ml-2 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio/Unidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Actual
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Presentación
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margen %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productosActuales.length > 0 ? (
              productosActuales.map((producto) => {
                const diasVencimiento = calcularDiasVencimiento(producto.fechaVencimiento);
                const estadoVencimiento = getEstadoVencimiento(diasVencimiento);
                
                return (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                        <div className="text-xs text-gray-500">{producto.proveedor}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          ${producto.precio.toLocaleString('es-CO')}
                        </div>
                        <div className="text-xs text-gray-500">
                          Compra: ${producto.precioCompra?.toLocaleString('es-CO') || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          producto.stock < 5 
                            ? 'bg-red-100 text-red-800' 
                            : producto.stock < 10 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {producto.stock} {producto.unidadMedida}
                        </span>
                        {producto.stock < 5 && (
                          <div className="flex items-center mt-1">
                            <FaExclamationTriangle className="text-red-500 text-xs mr-1" />
                            <span className="text-xs text-red-600">Stock bajo</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {producto.presentacion}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatearUnidad(producto.unidadMedida)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        producto.margenGanancia >= 40 
                          ? 'bg-green-100 text-green-800' 
                          : producto.margenGanancia >= 30 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {producto.margenGanancia?.toFixed(1) || 'N/A'}%
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoVencimiento.color}`}>
                          {estadoVencimiento.texto}
                        </span>
                        <span className="text-xs text-gray-500">
                          {diasVencimiento > 0 ? `${diasVencimiento} días` : 'Vencido'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditarProducto(producto)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded-md hover:bg-orange-50"
                          title="Editar producto"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => onEliminarProducto(producto)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          title="Eliminar producto"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500">
                  <div className="space-y-2">
                    <p className="text-gray-600">No se encontraron productos con los filtros aplicados.</p>
                    <button 
                      onClick={onLimpiarFiltros}
                      className="text-blue-500 hover:text-blue-700 underline font-medium"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaProductos;