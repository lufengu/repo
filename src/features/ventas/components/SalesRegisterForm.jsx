import { useState } from 'react';
import { FaPlus, FaTrash, FaSave, FaShoppingCart } from 'react-icons/fa';
import { MetricCard } from './index';
import SaleReceipt from './SaleReceipt';
import { ShoppingCart, DollarSign } from 'lucide-react';
// import { salesAPI } from '../services/ventasService'; // Descomenta cuando tengas el servicio

const productOptions = [
  { id: 'P001', name: 'Laptop HP', suggestedPrice: 2500000 },
  { id: 'P002', name: 'Mouse Logitech', suggestedPrice: 85000 },
  { id: 'P003', name: 'Teclado Gaming', suggestedPrice: 450000 },
  { id: 'P004', name: 'Monitor 24"', suggestedPrice: 800000 },
  { id: 'P005', name: 'Webcam HD', suggestedPrice: 320000 },
  { id: 'P006', name: 'Pan', suggestedPrice: 3000 },
  { id: 'P007', name: 'Azúcar', suggestedPrice: 4500 },
  { id: 'P008', name: 'Leche', suggestedPrice: 5200 },
  // ...otros productos
];

const paymentMethods = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' }
];

export default function SalesRegisterForm({ onSuccess }) {
  // Estados principales
  const [rows, setRows] = useState([
    { product: '', quantity: 1, price: '', error: {} }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [formError, setFormError] = useState('');
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // Cálculos
  const total = rows.reduce((sum, r) => sum + (r.quantity * (parseFloat(r.price) || 0)), 0);
  const totalItems = rows.reduce((sum, r) => sum + (r.quantity || 0), 0);

  const handleAddRow = () => {
    setRows([...rows, { product: '', quantity: 1, price: '', error: {} }]);
  };

  const handleRemoveRow = (idx) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== idx));
    }
  };

  const handleChange = (idx, field, value) => {
    const newRows = [...rows];
    
    if (field === 'product') {
      // Cuando se selecciona un producto, autocompletar el precio sugerido
      const selectedProduct = productOptions.find(p => p.name === value);
      newRows[idx][field] = value;
      if (selectedProduct && !newRows[idx].price) {
        newRows[idx].price = selectedProduct.suggestedPrice;
      }
    } else if (field === 'price') {
      newRows[idx][field] = value === '' ? '' : value;
    } else if (field === 'quantity') {
      newRows[idx][field] = Math.max(1, Number(value) || 1);
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
      if (!r.product) { 
        err.product = 'Selecciona un producto'; 
        ok = false; 
      }
      if (!r.quantity || r.quantity <= 0) { 
        err.quantity = 'Cantidad debe ser mayor a 0'; 
        ok = false; 
      }
      if (!r.price || parseFloat(r.price) <= 0) { 
        err.price = 'Precio debe ser mayor a 0'; 
        ok = false; 
      }
      return { ...r, error: err };
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
      items: rows.map(r => ({
        product: r.product,
        quantity: r.quantity,
        price: parseFloat(r.price),
        name: r.product // Para compatibilidad con el recibo
      })),
      payment_method: paymentMethod,
      paymentMethod: paymentMethod, // Para compatibilidad
      total,
      totalItems,
      customer: customer.name || 'Cliente General',
      phone: customer.phone || '',
      email: customer.email || '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    try {
      // Cuando tengas la API, descomenta esto:
      // await salesAPI.createSale(payload);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crear datos de venta completada para el recibo
      const saleData = {
        ...payload,
        id: Date.now(), // ID temporal
      };
      
      setCompletedSale(saleData);
      setShowReceipt(true);
      
      // Limpiar formulario
      setRows([{ product: '', quantity: 1, price: '', error: {} }]);
      setPaymentMethod('');
      setCustomer({ name: '', phone: '', email: '' });
      
      // Llamar callback si existe
      if (onSuccess) {
        onSuccess(saleData);
      }
      
    } catch (error) {
      console.error('Error al guardar venta:', error);
      setFormError('Error al guardar la venta. Por favor intenta nuevamente.');
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

  return (
    <div className="space-y-6">
      {/* Métricas de la venta actual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Total de la Venta"
          value={new Intl.NumberFormat('es-CO', {
            style: 'currency', 
            currency: 'COP', 
            minimumFractionDigits: 0
          }).format(total)}
          detail={`${totalItems} productos`}
          icon={<DollarSign className="w-8 h-8" />}
          gradient="from-green-500 to-green-600"
          colorText="text-green-100"
        />
        
        <MetricCard
          title="Productos en Venta"
          value={totalItems.toString()}
          detail={`${rows.filter(r => r.product).length} tipos diferentes`}
          icon={<ShoppingCart className="w-8 h-8" />}
          gradient="from-blue-500 to-blue-600"
          colorText="text-blue-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel principal - Formulario de venta */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center mb-6">
              <FaShoppingCart className="text-orange-500 mr-3 text-xl" />
              <h3 className="text-xl font-semibold text-gray-800">Registrar Nueva Venta</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tabla de productos */}
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase min-w-[200px]">
                        Producto
                      </th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase min-w-[120px]">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase min-w-[140px]">
                        Precio unit.
                      </th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase min-w-[140px]">
                        Subtotal
                      </th>
                      <th className="px-4 py-3 bg-gray-50 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <select
                            value={r.product}
                            onChange={e => handleChange(i, 'product', e.target.value)}
                            disabled={isSubmitting}
                            className={`w-full bg-white text-black border rounded-lg px-3 py-2 
                                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       ${r.error.product ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">– Selecciona un producto –</option>
                            {productOptions.map(p =>
                              <option key={p.id} value={p.name}>{p.name}</option>
                            )}
                          </select>
                          {r.error.product && (
                            <p className="mt-1 text-xs text-red-600">{r.error.product}</p>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={r.quantity}
                            onChange={e => handleChange(i, 'quantity', e.target.value)}
                            disabled={isSubmitting}
                            className={`w-full bg-white text-black border rounded-lg px-3 py-2 text-right
                                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       ${r.error.quantity ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {r.error.quantity && (
                            <p className="mt-1 text-xs text-red-600">{r.error.quantity}</p>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={r.price}
                            onChange={e => handleChange(i, 'price', e.target.value)}
                            disabled={isSubmitting}
                            placeholder="0"
                            className={`w-full bg-white text-black border rounded-lg px-3 py-2 text-right
                                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       ${r.error.price ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {r.error.price && (
                            <p className="mt-1 text-xs text-red-600">{r.error.price}</p>
                          )}
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-900">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency', 
                            currency: 'COP', 
                            minimumFractionDigits: 0
                          }).format((r.quantity || 0) * (parseFloat(r.price) || 0))}
                        </td>

                        <td className="px-4 py-3 text-center">
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

              {/* Agregar fila */}
              <button
                type="button"
                onClick={handleAddRow}
                disabled={isSubmitting}
                className="inline-flex items-center text-orange-600 hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <FaPlus className="mr-2" /> Agregar producto
              </button>

              {/* Método de pago y total */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-4 sm:space-y-0 pt-4 border-t border-gray-200">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Método de pago *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    disabled={isSubmitting}
                    className={`bg-white text-black border rounded-lg px-3 py-2 min-w-[200px]
                               focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                               disabled:opacity-50 disabled:cursor-not-allowed
                               ${formError && !paymentMethod ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">– Selecciona método –</option>
                    {paymentMethods.map(m =>
                      <option key={m.value} value={m.value}>{m.label}</option>
                    )}
                  </select>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total a pagar:</p>
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-center text-red-600 text-sm">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || total <= 0}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Guardando venta...</span>
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
        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Cliente</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre (Opcional)
                </label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => handleCustomerChange('name', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Nombre del cliente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => handleCustomerChange('phone', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Teléfono del cliente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Opcional)
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => handleCustomerChange('email', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                  placeholder="email@cliente.com"
                />
              </div>
            </div>

            {/* Resumen de la venta */}
            <div className="mt-6 pt-4 border-t border-gray-200">
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
    </div>
  );
}