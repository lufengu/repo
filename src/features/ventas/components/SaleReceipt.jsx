import React from 'react';

const SaleReceipt = ({ sale, onClose, onPrint }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular totales (ajustado para manejar múltiples productos)
  const calculateTotals = () => {
    if (sale.items && Array.isArray(sale.items)) {
      // Nuevo formato con items array
      const subtotal = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const iva = subtotal * 0.19; // 19% IVA
      const total = subtotal + iva;
      return { subtotal, iva, total };
    } else {
      // Formato legacy para compatibilidad
      const total = sale.price * sale.quantity;
      const subtotal = total / 1.19; // Calcular sin IVA
      const iva = total - subtotal;
      return { subtotal, iva, total };
    }
  };

  const { subtotal, iva, total } = calculateTotals();

  return (
    <>
      {/* Estilos para impresión tipo ticket */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #ticket-receipt, #ticket-receipt * {
              visibility: visible !important;
            }
            #ticket-receipt {
              position: static !important;
              left: 0 !important;
              top: 0 !important;
              width: 80mm !important;
              min-width: 80mm !important;
              max-width: 80mm !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif !important;
              font-size: 12px !important;
              background: #fff !important;
              color: #000 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow: visible !important;
            }
            #ticket-receipt .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          id="ticket-receipt"
          className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header del recibo */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">RECIBO DE VENTA</h2>
            <p className="text-sm text-gray-600">TechDero - Tu tienda digital</p>
            <p className="text-xs text-gray-500">NIT: 123.456.789-0</p>
            <p className="text-xs text-gray-500">Dirección: Calle Principal #123</p>
            <p className="text-xs text-gray-500">Tel: +57 (1) 234-5678</p>
          </div>

          {/* Información de la venta */}
          <div className="border-t border-b border-gray-200 py-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Recibo No:</span>
              <span className="text-sm font-medium">#{sale.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Fecha:</span>
              <span className="text-sm font-medium">
                {formatDate(sale.createdAt || sale.date || new Date())}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Cliente:</span>
              <span className="text-sm font-medium">{sale.customer || 'Cliente General'}</span>
            </div>
            {sale.phone && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Teléfono:</span>
                <span className="text-sm font-medium">{sale.phone}</span>
              </div>
            )}
          </div>

          {/* Detalles de los productos */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Detalles de la compra:</h3>
            
            {sale.items && Array.isArray(sale.items) ? (
              // Nuevo formato con múltiples productos
              <div className="space-y-2">
                {sale.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Cantidad: {item.quantity}</p>
                          <p>Precio unitario: {formatCurrency(item.price)}</p>
                          <p className="font-medium">Subtotal: {formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Formato legacy para compatibilidad
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{sale.product}</p>
                    <p className="text-sm text-gray-600">Cantidad: {sale.quantity}</p>
                    <p className="text-sm text-gray-600">Precio unitario: {formatCurrency(sale.price)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumen financiero */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">IVA (19%):</span>
              <span className="text-sm">{formatCurrency(iva)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>TOTAL:</span>
              <span className="text-green-600">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Método de pago:</span>
              <span className="text-sm font-medium capitalize">
                {sale.payment_method || sale.paymentMethod || 'Efectivo'}
              </span>
            </div>
            {sale.totalItems && (
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-600">Total productos:</span>
                <span className="text-sm font-medium">{sale.totalItems} unidades</span>
              </div>
            )}
          </div>

          {/* Información fiscal adicional */}
          <div className="bg-yellow-50 p-3 rounded mb-4 text-xs text-gray-600">
            <p className="font-medium mb-1">Información Fiscal:</p>
            <p>• Factura de venta por el sistema simplificado</p>
            <p>• Régimen común - Responsable de IVA</p>
            <p>• Actividad económica: Venta al por menor</p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mb-6">
            <p className="font-medium">¡Gracias por su compra!</p>
            <p>Su confianza es nuestro compromiso</p>
            <p className="mt-2">Para devoluciones presente este recibo</p>
            <p>Políticas de devolución: 15 días calendario</p>
          </div>

          {/* Botones de acción ocultos en impresión */}
          <div className="flex space-x-3 no-print">
            <button
              onClick={onPrint}
              className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              📄 Imprimir
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SaleReceipt;