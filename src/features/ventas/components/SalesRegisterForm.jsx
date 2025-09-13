import { useState, useEffect, useRef } from 'react';
import { getQrUrlForMethod } from '../services/qrFrontendService';
import { FaPlus, FaTrash, FaSave, FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa';
import { MetricCard } from './index';
import SaleReceipt from './SaleReceipt';
import { ShoppingCart, DollarSign, Search, Check } from 'lucide-react';
import { useProductosVentas } from '../hooks/useProductosVentas';
import { updateStockAfterSale } from '../../../services/inventoryService';
import { salesAPI } from '../services/salesService';

const paymentMethods = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'bancolombia', label: 'Bancolombia' }, // Para coincidir con QrPaymentForm
];

/** Combobox elegante con buscador integrado y scroll discreto */
function ProductComboBox({
  value,
  onChange,
  products,
  disabled = false,
  error = '',
  loading = false,
  placeholder = 'Buscar y seleccionar un producto…',
  query,
  onQueryChange,
  maxVisible = 4, // Cambia el valor por defecto a 5
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [page, setPage] = useState(1); // Estado para la página
  const ref = useRef(null);

  const filtered = (query || '')
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : products;

  const totalPages = Math.ceil(filtered.length / maxVisible);
  const startIdx = (page - 1) * maxVisible;
  const endIdx = startIdx + maxVisible;
  const visible = filtered.slice(startIdx, endIdx);

  useEffect(() => {
    function onClickOutside(e) {
      // Busca el formulario principal por id o ref
      const formElement = document.querySelector('form'); // O usa una prop ref si tienes varias instancias
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        !(formElement && formElement.contains(e.target))
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setHighlight(0);
    setPage(1); // Reinicia a la primera página al cambiar la búsqueda
  }, [query, open]);

  const selectItem = (item) => {
    onChange(item.name);
    onQueryChange(item.name);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((prev) => Math.min(prev + 1, Math.max(visible.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && visible[highlight]) {
        e.preventDefault();
        selectItem(visible[highlight]);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    }
  };

  const stockPill = (stock) => {
    if (stock < 5) return 'bg-red-100 text-red-800';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div ref={ref} className="relative">
      {/* Global tiny CSS para esconder scrollbars del panel */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Campo de texto (combobox) */}
      <div className={`flex items-center rounded-xl border ${error ? 'border-red-500' : 'border-gray-300'} bg-white pr-2 transition-all`}>
        <Search className="w-5 h-5 text-gray-400 ml-3" />
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls="combo-listbox"
          aria-autocomplete="list"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          disabled={disabled || loading}
          placeholder={loading ? 'Cargando productos…' : placeholder}
          className="w-full bg-white text-black rounded-l-xl px-3 py-2 focus:outline-none"
        />
        {value && (
          <span className="hidden sm:inline-flex items-center text-xs text-gray-500 px-2 py-1 rounded-lg bg-gray-50">
            <Check className="w-4 h-4 mr-1" /> Seleccionado
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          disabled={disabled || loading}
          className="ml-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Mostrar opciones"
        >
          ▾
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {/* Panel de opciones flotante (estilo command palette) */}
      {open && (
        <div
          className="absolute z-30 mt-2 left-0 w-[340px] sm:w-[400px] max-w-[95vw] rounded-2xl border border-gray-200 bg-white shadow-2xl"
          style={{ overflow: 'hidden' }}
          onWheel={e => e.stopPropagation()} // Evita que el scroll cierre el panel
        >
          <div className="sticky top-0 bg-white/90 backdrop-blur px-3 py-2 border-b">
            <p className="text-xs text-gray-500">
              {loading ? 'Buscando…' : `Resultados: ${filtered.length}`}
            </p>
          </div>
          <ul
            id="combo-listbox"
            role="listbox"
            className="scrollbar-none"
          >
            {loading && (
              Array.from({ length: 6 }).map((_, idx) => (
                <li key={`s-${idx}`} className="px-3 py-2">
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                </li>
              ))
            )}
            {!loading && filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-gray-500">Sin resultados</li>
            )}
            {!loading && visible.map((item, idx) => (
              <li
                key={item.id}
                role="option"
                aria-selected={value === item.name}
                onMouseDown={(e) => { e.preventDefault(); selectItem(item); }}
                onMouseEnter={() => setHighlight(idx)}
                className={`px-3 py-2 cursor-pointer transition-colors
                            ${idx === highlight ? 'bg-blue-50' : 'bg-white'}
                            ${value === item.name ? 'font-medium text-gray-900' : 'text-gray-800'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  <span className={`ml-3 inline-flex px-2 py-0.5 rounded-full text-[11px] ${stockPill(item.stock)}`}>
                    Stock: {item.stock} {item.unidadMedida}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Precio: ${(item.price ?? item.suggestedPrice ?? 0).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-3 py-2 border-t bg-gray-50 gap-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="min-w-[75px] px-2 py-1.5 rounded-md text-sm bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
              >
                ◀ Anterior
              </button>
              <span className="text-sm text-gray-700 text-center font-medium min-w-[55px]">
                {page}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="min-w-[75px] px-2 py-1.5 rounded-md text-sm bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
              >
                Siguiente ▶
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SalesRegisterForm({ onSuccess }) {
  // Obtener usuario actual (se usa el localStorage en otros lugares si es necesario)
  // Hook para productos del inventario
  const {
    productos: productOptions,
    loading: loadingProducts,
    error: errorProducts,
    verificarStock,
    obtenerProductoPorNombre,
    cargarProductosParaVenta
  } = useProductosVentas();

  // Estados principales
  const [rows, setRows] = useState([
    { product: '', quantity: 1, price: '', error: {}, stockWarning: '' }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [formError, setFormError] = useState('');
  const [customer, setCustomer] = useState({
  name: '',
  email: '',
    cedula: '',
    direccion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // Estado por fila para el texto del buscador
  const [productSearch, setProductSearch] = useState(['']);

  // Estado para QR del método de pago (se consulta al cambiar método)
  const [qrPreview, setQrPreview] = useState(null);

  // Cálculos
  const subtotal = rows.reduce((sum, r) => sum + (r.quantity * (parseFloat(r.price) || 0)), 0);
  const totalItems = rows.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;
  // Consultar QR al cambiar método de pago
  useEffect(() => {
    let ignore = false;
    async function fetchQr() {
      if (!paymentMethod) {
        setQrPreview(null);
        return;
      }
      const url = await getQrUrlForMethod(paymentMethod);
      if (!ignore) setQrPreview(url);
    }
    fetchQr();
    return () => { ignore = true; };
  }, [paymentMethod]);

  const handleAddRow = () => {
    setRows(prev => [...prev, { product: '', quantity: 1, price: '', error: {}, stockWarning: '' }]);
    setProductSearch(prev => [...prev, '']);
  };

  const handleRemoveRow = (idx) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== idx));
      setProductSearch(productSearch.filter((_, i) => i !== idx));
    }
  };

  const handleChange = (idx, field, value) => {
    const newRows = [...rows];

    if (field === 'product') {
      const selectedProduct = productOptions.find(p => p.name === value);
      newRows[idx][field] = value;
      // Autocompletar precio sugerido si no había precio cargado
      if (selectedProduct && !newRows[idx].price) {
        const suggested = selectedProduct.suggestedPrice ?? selectedProduct.price ?? '';
        newRows[idx].price = suggested;
      }
      // Limpiar advertencia de stock al cambiar producto
      newRows[idx].stockWarning = '';
    } else if (field === 'price') {
      newRows[idx][field] = value === '' ? '' : value;
    } else if (field === 'quantity') {
      const cantidad = Math.max(1, Number(value) || 1);
      newRows[idx][field] = cantidad;

      // Validar stock cuando cambia la cantidad
      if (newRows[idx].product) {
        const producto = obtenerProductoPorNombre(newRows[idx].product);
        if (producto) {
          const stockCheck = verificarStock(producto.id, cantidad);
          newRows[idx].stockWarning = stockCheck.disponible ? '' : stockCheck.mensaje;
        }
      }
    } else {
      newRows[idx][field] = value;
    }

    // Limpiar errores del campo modificado
    newRows[idx].error[field] = '';
    setRows(newRows);
    setFormError('');
  };

  const handleCustomerChange = (field, value) => {
    setCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validate = () => {
    let ok = true;
    const newRows = rows.map(r => {
      const err = {};
      let stockWarning = r.stockWarning || '';

      if (!r.product) {
        err.product = 'Selecciona un producto';
        ok = false;
      } else {
        // Validar stock disponible
        const producto = obtenerProductoPorNombre(r.product);
        if (producto) {
          const stockCheck = verificarStock(producto.id, r.quantity);
          if (!stockCheck.disponible) {
            err.quantity = stockCheck.mensaje;
            stockWarning = stockCheck.mensaje;
            ok = false;
          }
        }
      }

      if (!r.quantity || r.quantity <= 0) {
        err.quantity = 'Cantidad debe ser mayor a 0';
        ok = false;
      }

      if (!r.price || parseFloat(r.price) <= 0) {
        err.price = 'Precio debe ser mayor a 0';
        ok = false;
      }

      return { ...r, error: err, stockWarning };
    });

    setRows(newRows);

    if (!paymentMethod) {
      setFormError('Selecciona un método de pago');
      ok = false;
    } else {
      setFormError('');
    }

    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setFormError('');

    const payload = {
      items: rows.map(r => {
        // Intentar resolver el producto seleccionado a su ID actual
        const producto = obtenerProductoPorNombre(r.product);
        return {
          product: producto ? producto.id : r.product,
          productName: r.product,
          quantity: r.quantity,
          price: parseFloat(r.price),
          name: r.product // Para compatibilidad con el recibo
        };
      }),
      payment_method: paymentMethod,
      paymentMethod: paymentMethod, // Para compatibilidad
      total,
      totalItems,

      customer: customer.name || 'Cliente General',
  // phone removed per request; backend may ignore this field
      email: customer.email || '',
      cedula: customer.cedula || '',
      direccion: customer.direccion || '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    try {
      // Guardar la venta en el backend
      const savedSale = await salesAPI.createSale(payload);
      console.log('Venta guardada exitosamente:', savedSale);

      // Actualizar stock en el inventario
      try {
        await updateStockAfterSale(payload.items);
        // Recargar productos para actualizar stock disponible
        await cargarProductosParaVenta();
      } catch (stockError) {
        console.error('Error al actualizar stock:', stockError);
        setFormError('Venta guardada, pero error al actualizar inventario: ' + stockError.message);
        return; // No limpiar el formulario si hay error de stock
      }

      // Crear datos de venta completada para el recibo
      const saleData = {
        ...payload,
        id: savedSale.id || Date.now(), // Usar ID del backend o temporal
      };

    setCompletedSale(saleData);
    setShowReceipt(true);

  // Limpiar formulario
  setRows([{ product: '', quantity: 1, price: '', error: {}, stockWarning: '' }]);
  setPaymentMethod('');
  // Limpiar cliente incluyendo cédula y dirección
  setCustomer({ name: '', cedula: '', direccion: '', email: '' });
  setProductSearch(['']);

      // Notificar al padre para mostrar el modal de éxito
      if (onSuccess) onSuccess(saleData);

    } catch (error) {
      console.error('Error al guardar venta:', error);
      setFormError(`Error al guardar la venta: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCompletedSale(null);
  };

  const formRef = useRef(null); // Nueva referencia para el formulario

  return (
    <div className="space-y-6 overflow-visible w-full">
      <style>{`
        .ventas-form-text {
          font-size: 1.07rem;
        }
        .ventas-form-label {
          font-size: 1rem;
        }
      `}</style>
      {/* Error de carga de productos */}
      {errorProducts && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <p className="text-red-700">Error al cargar productos: {errorProducts}</p>
          </div>
        </div>
      )}

      {/* Métricas de la venta actual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <MetricCard
          title="Subtotal"
          value={new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
          }).format(subtotal)}
          detail={`Sin IVA`}
          icon={<DollarSign className="w-8 h-8" />}
          gradient="from-blue-500 to-blue-600"
          colorText="text-blue-100"
        />
        <MetricCard
          title="IVA (19%)"
          value={new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
          }).format(iva)}
          detail={`Calculado sobre subtotal`}
          icon={<DollarSign className="w-8 h-8" />}
          gradient="from-blue-500 to-blue-600"
          colorText="text-blue-100"
        />
        <MetricCard
          title="Total de la Venta"
          value={new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
          }).format(total)}
          detail={`${totalItems} productos`}
          icon={<DollarSign className="w-8 h-8" />}
          gradient="from-blue-500 to-blue-600"
          colorText="text-blue-100"
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 w-full">
        {/* Panel principal - Formulario de venta */}
        <div className="w-full xl:w-2/3">
          <div className="bg-white shadow-lg rounded-2xl p-2 sm:p-4 md:p-6 w-full" style={{ overflow: 'visible' }}>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 w-full ventas-form-text">
              {/* Tabla de productos */}
              <div className="w-full">
                <table className="w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 sm:px-4 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase ventas-form-label">
                        Producto
                      </th>
                      <th className="px-2 sm:px-4 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase ventas-form-label">
                        Cantidad
                      </th>
                      <th className="px-2 sm:px-4 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase ventas-form-label">
                        Precio unit.
                      </th>
                      <th className="px-2 sm:px-4 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase ventas-form-label">
                        Subtotal
                      </th>
                      <th className="px-2 sm:px-4 py-3 bg-gray-50"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {/* Columna Producto: combobox estilizado */}
                        <td className="px-2 sm:px-4 py-3">
                          <ProductComboBox
                            value={r.product}
                            products={productOptions}
                            disabled={isSubmitting || loadingProducts}
                            loading={loadingProducts}
                            error={r.error.product}
                            query={productSearch[i] || ''}
                            onQueryChange={(text) => {
                              const next = [...productSearch];
                              next[i] = text;
                              setProductSearch(next);

                              // Si el usuario borra todo, limpiamos la selección y el precio
                              if (text.trim() === '') {
                                handleChange(i, 'product', '');
                                handleChange(i, 'price', '');
                                return;
                              }
                              // Solo autocompletar si la coincidencia es exacta
                              const match = productOptions.find(
                                p => p.name.toLowerCase() === text.trim().toLowerCase()
                              );
                              if (match) {
                                handleChange(i, 'product', match.name);
                                handleChange(i, 'price', match.suggestedPrice ?? match.price ?? '');
                              } else {
                                handleChange(i, 'product', text);
                                handleChange(i, 'price', '');
                              }
                            }}
                            onChange={(name) => {
                              handleChange(i, 'product', name);
                              // Autocompletar precio al seleccionar desde el combobox
                              const match = productOptions.find(p => p.name === name);
                              if (match) {
                                handleChange(i, 'price', match.suggestedPrice ?? match.price ?? '');
                              }
                            }}
                          />

                          {/* Chip de disponibilidad */}
                          {r.product && !r.error.product && (() => {
                            const producto = obtenerProductoPorNombre(r.product);
                            return producto ? (
                              <div className="mt-1 text-xs text-gray-600 flex items-center">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  producto.stock < 5
                                    ? 'bg-red-100 text-red-800'
                                    : producto.stock < 10
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  Disponible: {producto.stock} {producto.unidadMedida}
                                </span>
                              </div>
                            ) : null;
                          })()}
                        </td>

                        {/* Cantidad */}
                        <td className="px-2 sm:px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={r.quantity}
                            onChange={e => handleChange(i, 'quantity', e.target.value)}
                            disabled={isSubmitting}
                            className={`w-full bg-white text-black border rounded-lg px-2 sm:px-3 py-2 text-right ventas-form-text
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       ${r.error.quantity || r.stockWarning ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {r.error.quantity && (
                            <p className="mt-1 text-xs text-red-600">{r.error.quantity}</p>
                          )}
                          {r.stockWarning && !r.error.quantity && (
                            <div className="mt-1 flex items-center">
                              <FaExclamationTriangle className="text-blue-500 text-xs mr-1" />
                              <p className="text-xs text-blue-600">{r.stockWarning}</p>
                            </div>
                          )}
                        </td>

                        {/* Precio unitario */}
                        <td className="px-2 sm:px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={r.price}
                            readOnly
                            disabled={isSubmitting}
                            placeholder="0"
                            className={`w-full bg-gray-100 text-black border rounded-lg px-2 sm:px-3 py-2 text-right ventas-form-text
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       ${r.error.price ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {r.error.price && (
                            <p className="mt-1 text-xs text-red-600">{r.error.price}</p>
                          )}
                        </td>

                        {/* Subtotal */}
                        <td className="px-2 sm:px-4 py-3 font-medium text-gray-900">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0
                          }).format((r.quantity || 0) * (parseFloat(r.price) || 0))}
                        </td>

                        {/* Eliminar fila */}
                        <td className="px-2 sm:px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(i)}
                            disabled={isSubmitting || rows.length === 1}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                            title={rows.length === 1 ? "Debe haber al menos un producto" : "Eliminar producto"}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Agregar fila - Mover a la derecha */}
              <div className="flex justify-end w-full">
                <button
                  type="button"
                  onClick={handleAddRow}
                  disabled={isSubmitting}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium ventas-form-text"
                >
                  <FaPlus className="mr-2" /> Agregar producto
                </button>
              </div>

              {/* Método de pago, QR y total */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-4 sm:space-y-0 pt-4 border-t border-gray-200 w-full">
                <div className="flex flex-col space-y-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-gray-700">
                    <span className="ventas-form-label">Método de pago *</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    disabled={isSubmitting}
                    className={`bg-white text-black border rounded-lg px-3 py-2 min-w-[160px] sm:min-w-[200px] w-full sm:w-auto ventas-form-text
                               focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                               disabled:opacity-50 disabled:cursor-not-allowed
                               ${formError && !paymentMethod ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">– Selecciona método –</option>
                    {paymentMethods.map(m =>
                      <option key={m.value} value={m.value}>{m.label}</option>
                    )}
                  </select>
                  {/* Mostrar QR */}
                  {qrPreview && (
                    <div className="mt-3 flex flex-col items-center">
                      <span className="text-xs text-gray-500 mb-1">QR registrado para este método:</span>
                      <div style={{ width: 400, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          src={qrPreview} 
                          alt="QR de pago" 
                          className="object-contain border-2 border-blue-400 rounded-xl shadow-lg"
                          style={{ width: '100%', height: '100%', maxWidth: 400, maxHeight: 400 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right w-full sm:w-auto">
                  <p className="text-sm text-gray-600 mb-1">Subtotal:</p>
                  <div className="text-lg font-semibold text-gray-700">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(subtotal)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1 mt-2">IVA (19%):</p>
                  <div className="text-lg font-semibold text-yellow-700">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(iva)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1 mt-2">Total a pagar:</p>
                  <div className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(total)}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full">
                  <p className="text-center text-red-600 text-sm">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || total <= 0 || productOptions.length === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ventas-form-text"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Guardando venta...</span>
                  </>
                ) : productOptions.length === 0 ? (
                  <>
                    <FaExclamationTriangle />
                    <span>Sin productos disponibles</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Guardar venta</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Panel lateral - Información del cliente */}
        <div className="w-full xl:w-1/3">
          <div className="bg-white shadow-lg rounded-2xl p-2 sm:p-4 md:p-6 w-full ventas-form-text">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 ventas-form-label">Información del Cliente</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ventas-form-label">
                  Nombre (Opcional)
                </label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => handleCustomerChange('name', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ventas-form-text"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ventas-form-label">
                  Cédula (Opcional)
                </label>
                <input
                  type="text"
                  value={customer.cedula}
                  onChange={(e) => handleCustomerChange('cedula', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 ventas-form-text"
                  placeholder="Cédula del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ventas-form-label">
                  Dirección (Opcional)
                </label>
                <input
                  type="text"
                  value={customer.direccion}
                  onChange={(e) => handleCustomerChange('direccion', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 ventas-form-text"
                  placeholder="Dirección del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ventas-form-label">
                  Email (Opcional)
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => handleCustomerChange('email', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 ventas-form-text"
                  placeholder="email@cliente.com"
                />
              </div>
            </div>

            {/* Resumen de la venta */}
            <div className="mt-6 pt-4 border-t border-gray-200 w-full">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Resumen de la Venta</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Productos:</span>
                  <span className="font-medium">{rows.filter(r => r.product).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unidades:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-medium capitalize">
                    {paymentMethod || 'No seleccionado'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-700">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (19%):</span>
                  <span className="font-medium text-yellow-700">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(iva)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-green-600">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal del recibo */}
      {showReceipt && completedSale && (
        <SaleReceipt
          sale={completedSale}
          onClose={handleCloseReceipt}
          onPrint={handlePrintReceipt}
        />
      )}
      {/* Modal de éxito se maneja en el componente padre (Ventas.jsx) */}
    </div>
  );
}
