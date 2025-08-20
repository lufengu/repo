import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaInfoCircle } from 'react-icons/fa';

const ModalEditarProducto = ({ isOpen, onClose, onEditarProducto, producto, categorias }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    precio: '',
    stock: '',
    unidadMedida: 'und',
    presentacion: '',
    proveedor: '',
    fechaVencimiento: '',
    precioCompra: ''
  });

  const unidadesMedida = [
    { value: 'und', label: 'Unidad', ejemplo: 'Ej: 25 unidades de pan' },
    { value: 'kg', label: 'Kilogramo', ejemplo: 'Ej: 20 kilos de arroz' },
    { value: 'g', label: 'Gramo', ejemplo: 'Ej: 500 gramos de café' },
    { value: 'lt', label: 'Litro', ejemplo: 'Ej: 15 litros de leche' },
    { value: 'ml', label: 'Mililitro', ejemplo: 'Ej: 330 ml de cerveza' },
    { value: 'lb', label: 'Libra', ejemplo: 'Ej: 10 libras de carne' },
    { value: 'oz', label: 'Onza', ejemplo: 'Ej: 8 onzas de queso' },
    { value: 'pqt', label: 'Paquete', ejemplo: 'Ej: 12 paquetes de galletas' },
    { value: 'cj', label: 'Caja', ejemplo: 'Ej: 6 cajas de cereal' },
    { value: 'bot', label: 'Botella', ejemplo: 'Ej: 24 botellas de agua' }
  ];

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const categoriasDisponibles = categorias.filter(cat => cat !== 'Todas');

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (isOpen && producto) {
      setFormData({
        nombre: producto.nombre || '',
        categoria: producto.categoria || '',
        precio: producto.precio?.toString() || '',
        stock: producto.stock?.toString() || '',
        unidadMedida: producto.unidadMedida || 'und',
        presentacion: producto.presentacion || '',
        proveedor: producto.proveedor || '',
        fechaVencimiento: producto.fechaVencimiento || '',
        precioCompra: producto.precioCompra?.toString() || ''
      });
      setErrors({});
    }
  }, [isOpen, producto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Calcular margen automáticamente si cambian precio o precio de compra
    if (name === 'precio' || name === 'precioCompra') {
      const precio = name === 'precio' ? parseFloat(value) : parseFloat(formData.precio);
      const precioCompra = name === 'precioCompra' ? parseFloat(value) : parseFloat(formData.precioCompra);
      
      if (precio > 0 && precioCompra > 0) {
        const margen = (((precio - precioCompra) / precio) * 100).toFixed(1);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          margenGanancia: margen
        }));
      }
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      categoria: '',
      precio: '',
      stock: '',
      unidadMedida: 'und',
      presentacion: '',
      proveedor: '',
      fechaVencimiento: '',
      precioCompra: ''
    });
    setErrors({});
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!formData.categoria.trim()) {
      nuevosErrores.categoria = 'La categoría es obligatoria';
    }

    if (!formData.precio || isNaN(formData.precio) || parseFloat(formData.precio) <= 0) {
      nuevosErrores.precio = 'El precio debe ser un número mayor a 0';
    }

    if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      nuevosErrores.stock = 'El stock debe ser un número mayor o igual a 0';
    }

    if (formData.precioCompra && (isNaN(formData.precioCompra) || parseFloat(formData.precioCompra) < 0)) {
      nuevosErrores.precioCompra = 'El precio de compra debe ser un número mayor o igual a 0';
    }

    if (parseFloat(formData.precio) > 0 && parseFloat(formData.precioCompra) > 0) {
      if (parseFloat(formData.precioCompra) >= parseFloat(formData.precio)) {
        nuevosErrores.precioCompra = 'El precio de compra debe ser menor al precio de venta';
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setIsLoading(true);

    try {
      const productoEditado = {
        id: producto.id,
        nombre: formData.nombre.trim(),
        precio: parseFloat(formData.precio),
        precioCompra: parseFloat(formData.precioCompra) || 0,
        stock: parseInt(formData.stock),
        categoria: formData.categoria.trim(),
        unidadMedida: formData.unidadMedida,
        presentacion: formData.presentacion.trim(),
        proveedor: formData.proveedor.trim(),
        fechaVencimiento: formData.fechaVencimiento || null,
        margenGanancia: formData.margenGanancia || 0
      };

      await onEditarProducto(productoEditado);
      
      // Cerrar modal
      onClose();
      
    } catch (error) {
      console.error('Error al editar producto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <FaSave className="mr-2" />
            <h2 className="text-lg font-semibold">Editar Producto</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-white hover:text-gray-200 disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Formulario */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nombre del producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del producto *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ejemplo: Arroz Diana"
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.categoria ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar categoría</option>
                {categoriasDisponibles.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>
              )}
            </div>

            {/* Precio y Stock en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de venta *
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.precio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.precio && (
                  <p className="text-red-500 text-xs mt-1">{errors.precio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock disponible *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.stock ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* Precio de compra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de compra (opcional)
              </label>
              <input
                type="number"
                name="precioCompra"
                value={formData.precioCompra}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.precioCompra ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.precioCompra && (
                <p className="text-red-500 text-xs mt-1">{errors.precioCompra}</p>
              )}
            </div>

            {/* Información adicional (solo lectura en edición básica) */}
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600 mb-2">
                <FaInfoCircle className="inline mr-1" />
                Información adicional (solo lectura)
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Unidad de medida:</span> {formData.unidadMedida}
                </div>
                <div>
                  <span className="font-medium">Proveedor:</span> {formData.proveedor || 'No especificado'}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaSave className="mr-2" />
                )}
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarProducto;
