import React, { useState } from 'react';
import { FaTimes, FaPlus, FaInfoCircle } from 'react-icons/fa';

const ModalAgregarProducto = ({ isOpen, onClose, onAgregarProducto, categorias }) => {
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

  const categoriasColombiana = [
    'Granos y Cereales',
    'Lácteos',
    'Panadería',
    'Aceites y Vinagres',
    'Endulzantes',
    'Bebidas Calientes',
    'Bebidas Alcohólicas',
    'Carnes y Embutidos',
    'Frutas y Verduras',
    'Limpieza',
    'Aseo Personal',
    'Snacks y Dulces'
  ];

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const categoriasDisponibles = categorias.filter(cat => cat !== 'Todas');

  // Obtener la unidad seleccionada para mostrar información contextual
  const unidadSeleccionada = unidadesMedida.find(u => u.value === formData.unidadMedida);

  // Limpiar formulario
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
    setMostrarNuevaCategoria(false);
    setNuevaCategoria('');
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si selecciona "nueva categoria", mostrar input
    if (name === 'categoria' && value === 'nueva_categoria') {
      setMostrarNuevaCategoria(true);
      setFormData(prev => ({ ...prev, categoria: '' }));
    } else if (name === 'categoria' && value !== 'nueva_categoria') {
      setMostrarNuevaCategoria(false);
      setNuevaCategoria('');
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar cambio en nueva categoría
  const handleNuevaCategoriaChange = (e) => {
    const value = e.target.value;
    setNuevaCategoria(value);
    setFormData(prev => ({
      ...prev,
      categoria: value
    }));
    
    // Limpiar error si existe
    if (errors.categoria) {
      setErrors(prev => ({
        ...prev,
        categoria: ''
      }));
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    if (!formData.precio || isNaN(formData.precio) || parseFloat(formData.precio) <= 0) {
      nuevosErrores.precio = 'El precio debe ser un número mayor a 0';
    }

    if (!formData.precioCompra || isNaN(formData.precioCompra) || parseFloat(formData.precioCompra) <= 0) {
      nuevosErrores.precioCompra = 'El precio de compra debe ser un número mayor a 0';
    }

    if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      nuevosErrores.stock = 'El stock debe ser un número mayor o igual a 0';
    }

    if (!formData.categoria || formData.categoria.trim() === '') {
      nuevosErrores.categoria = 'La categoría es requerida';
    }

    if (!formData.presentacion.trim()) {
      nuevosErrores.presentacion = 'La presentación es requerida';
    }

    // Validar que la nueva categoría no sea duplicada
    if (mostrarNuevaCategoria && categoriasDisponibles.some(cat => 
      cat.toLowerCase() === formData.categoria.toLowerCase().trim()
    )) {
      nuevosErrores.categoria = 'Esta categoría ya existe';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setIsLoading(true);

    try {
      // Preparar datos del producto
      const nuevoProducto = {
        nombre: formData.nombre.trim(),
        precio: parseFloat(formData.precio),
        precioCompra: parseFloat(formData.precioCompra),
        stock: parseInt(formData.stock),
        categoria: formData.categoria.trim(),
        unidadMedida: formData.unidadMedida,
        presentacion: formData.presentacion.trim(),
        proveedor: formData.proveedor.trim(),
        fechaVencimiento: formData.fechaVencimiento || null,
        margenGanancia: (((parseFloat(formData.precio) - parseFloat(formData.precioCompra)) / parseFloat(formData.precio)) * 100)
      };

      await onAgregarProducto(nuevoProducto);
      
      // Limpiar y cerrar modal
      limpiarFormulario();
      onClose();
      
    } catch (error) {
      console.error('Error al agregar producto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isLoading) {
      limpiarFormulario();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaPlus className="text-blue-500" />
            Agregar Nuevo Producto
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre del producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del producto *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Arroz Diana"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.nombre ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor
              </label>
              <input
                type="text"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                placeholder="Ej: Diana S.A."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.categoria ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categoriasColombiana.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
              {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>}
            </div>

            {/* Unidad de Medida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de medida *
              </label>
              <select
                name="unidadMedida"
                value={formData.unidadMedida}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                {unidadesMedida.map(unidad => (
                  <option key={unidad.value} value={unidad.value}>
                    {unidad.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Presentación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presentación *
              </label>
              <input
                type="text"
                name="presentacion"
                value={formData.presentacion}
                onChange={handleChange}
                placeholder="Ej: 1 kg, 500ml, 250g"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.presentacion ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.presentacion && <p className="text-red-500 text-xs mt-1">{errors.presentacion}</p>}
            </div>

            {/* Stock Inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock inicial (unidades para venta) *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Ej: 20"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.stock ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {unidadSeleccionada && (
                <div className="flex items-start mt-2 p-2 bg-blue-50 rounded-md">
                  <FaInfoCircle className="text-blue-500 text-xs mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    {unidadSeleccionada.ejemplo}
                  </p>
                </div>
              )}
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>

            {/* Precio de Compra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de compra por {formData.unidadMedida} (COP) *
              </label>
              <input
                type="number"
                name="precioCompra"
                value={formData.precioCompra}
                onChange={handleChange}
                placeholder="Ej: 2500"
                min="0"
                step="100"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.precioCompra ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.precioCompra && <p className="text-red-500 text-xs mt-1">{errors.precioCompra}</p>}
            </div>

            {/* Precio de Venta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de venta por {formData.unidadMedida} (COP) *
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                placeholder="Ej: 3500"
                min="0"
                step="100"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.precio ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {formData.precioCompra && formData.precio && (
                <p className="text-xs text-gray-500 mt-1">
                  Margen: {(((formData.precio - formData.precioCompra) / formData.precio) * 100).toFixed(1)}%
                </p>
              )}
              {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
            </div>

            {/* Fecha de Vencimiento */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de vencimiento
              </label>
              <input
                type="date"
                name="fechaVencimiento"
                value={formData.fechaVencimiento}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Resumen del producto */}
          {formData.nombre && formData.stock && formData.unidadMedida && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resumen del producto:</h3>
              <p className="text-sm text-gray-600">
                Se agregarán <span className="font-semibold text-gray-800">{formData.stock} {formData.unidadMedida}</span> de {formData.nombre} al inventario
              </p>
              {formData.precio && (
                <p className="text-sm text-gray-600 mt-1">
                  Cada {formData.unidadMedida} se venderá a <span className="font-semibold text-green-600">${parseInt(formData.precio).toLocaleString('es-CO')} COP</span>
                </p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Agregando...
                </>
              ) : (
                <>
                  <FaPlus />
                  Agregar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAgregarProducto;