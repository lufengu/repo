import React, { useState } from 'react';
import { FaTimes, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const ModalEliminarProducto = ({ isOpen, onClose, onEliminarProducto, producto }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmarEliminacion = async () => {
    if (!producto) return;

    setIsLoading(true);
    try {
      await onEliminarProducto(producto.id);
      onClose();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-red-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <h2 className="text-lg font-semibold">Confirmar Eliminación</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-white hover:text-gray-200 disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <FaTrash className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¿Estás seguro de que deseas eliminar este producto?
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {producto.nombre}
                </p>
                <p className="text-sm text-gray-600">
                  Categoría: {producto.categoria}
                </p>
                <p className="text-sm text-gray-600">
                  Stock actual: {producto.stock} {producto.unidadMedida}
                </p>
                <p className="text-sm text-gray-600">
                  Precio: ${producto.precio?.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Esta acción no se puede deshacer. El producto será eliminado permanentemente del inventario.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmarEliminacion}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FaTrash className="mr-2" />
              )}
              {isLoading ? 'Eliminando...' : 'Eliminar Producto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarProducto;
