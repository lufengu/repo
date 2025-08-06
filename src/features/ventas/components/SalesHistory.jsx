import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaDownload, FaCalendarAlt } from 'react-icons/fa';
import { MetricCard } from './index';
import SaleReceipt from './SaleReceipt';
import { TrendingUp, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
// import { salesAPI } from '../../../services/salesService'; // Descomenta cuando tengas el servicio

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);

  // Datos de ejemplo mientras implementas la API
  const mockSales = [
    {
      id: 1,
      product: 'Laptop HP',
      quantity: 1,
      price: 2500000,
      payment_method: 'tarjeta',
      customer: 'Juan Pérez',
      phone: '3001234567',
      createdAt: '2025-01-15T14:30:00.000Z',
      date: '2025-01-15',
      time: '14:30',
      items: [
        { name: 'Laptop HP', quantity: 1, price: 2500000 }
      ],
      total: 2500000,
      totalItems: 1
    },
    {
      id: 2,
      product: 'Mouse Logitech',
      quantity: 2,
      price: 85000,
      payment_method: 'efectivo',
      customer: 'María García',
      phone: '3009876543',
      createdAt: '2025-01-15T16:45:00.000Z',
      date: '2025-01-15',
      time: '16:45',
      items: [
        { name: 'Mouse Logitech', quantity: 2, price: 85000 }
      ],
      total: 170000,
      totalItems: 2
    },
    {
      id: 3,
      product: 'Teclado Gaming',
      quantity: 1,
      price: 450000,
      payment_method: 'transferencia',
      customer: 'Carlos López',
      phone: '3005555555',
      createdAt: '2025-01-14T10:15:00.000Z',
      date: '2025-01-14',
      time: '10:15',
      items: [
        { name: 'Teclado Gaming', quantity: 1, price: 450000 }
      ],
      total: 450000,
      totalItems: 1
    },
    {
      id: 4,
      product: 'Monitor 24"',
      quantity: 1,
      price: 800000,
      payment_method: 'tarjeta',
      customer: 'Ana Rodríguez',
      phone: '',
      createdAt: '2025-01-14T11:30:00.000Z',
      date: '2025-01-14',
      time: '11:30',
      items: [
        { name: 'Monitor 24"', quantity: 1, price: 800000 }
      ],
      total: 800000,
      totalItems: 1
    },
    {
      id: 5,
      product: 'Webcam HD',
      quantity: 3,
      price: 320000,
      payment_method: 'efectivo',
      customer: 'Luis Martínez',
      phone: '3007777777',
      createdAt: '2025-01-13T15:20:00.000Z',
      date: '2025-01-13',
      time: '15:20',
      items: [
        { name: 'Webcam HD', quantity: 3, price: 320000 }
      ],
      total: 960000,
      totalItems: 3
    }
  ];

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    // Filtrar ventas según búsqueda y fecha
    let filtered = sales;

    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.phone?.includes(searchTerm) ||
        sale.id.toString().includes(searchTerm) ||
        sale.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
        return saleDate === dateFilter;
      });
    }

    setFilteredSales(filtered);
  }, [searchTerm, dateFilter, sales]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      // Cuando tengas la API, descomenta esto:
      // const data = await salesAPI.getSales();
      // setSales(data);
      
      // Mientras tanto, usar datos de ejemplo:
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular carga
      setSales(mockSales);
      setFilteredSales(mockSales);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de formato (las de tu compañero)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular métricas
  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || sale.price * sale.quantity), 0);
  const totalTransactions = filteredSales.length;
  const totalItemsSold = filteredSales.reduce((sum, sale) => sum + (sale.totalItems || sale.quantity), 0);
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
  };

  const handleShowReceipt = (sale) => {
    setReceiptSale(sale);
    setShowReceipt(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptSale(null);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Cargando historial de ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas del historial */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total en Ventas"
          value={formatCurrency(totalSales)}
          detail={`${totalTransactions} transacciones`}
          icon={<DollarSign className="w-8 h-8" />}
          gradient="from-green-500 to-green-600"
          colorText="text-green-100"
        />
        
        <MetricCard
          title="Productos Vendidos"
          value={totalItemsSold.toString()}
          detail={`En ${totalTransactions} ventas`}
          icon={<ShoppingBag className="w-8 h-8" />}
          gradient="from-blue-500 to-blue-600"
          colorText="text-blue-100"
        />
        
        <MetricCard
          title="Ticket Promedio"
          value={formatCurrency(averageTicket)}
          detail="Por transacción"
          icon={<TrendingUp className="w-8 h-8" />}
          gradient="from-purple-500 to-purple-600"
          colorText="text-purple-100"
        />
        
        <MetricCard
          title="Ventas Hoy"
          value={filteredSales.filter(s => {
            const today = new Date().toISOString().split('T')[0];
            const saleDate = new Date(s.createdAt).toISOString().split('T')[0];
            return saleDate === today;
          }).length.toString()}
          detail="Transacciones realizadas"
          icon={<Calendar className="w-8 h-8" />}
          gradient="from-orange-500 to-orange-600"
          colorText="text-orange-100"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Filtrar Ventas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por producto, cliente, teléfono o método de pago..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Historial de Ventas ({filteredSales.length})</h3>
        </div>
        
        {filteredSales.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No hay ventas registradas aún</p>
            <p className="text-sm">o no se encontraron ventas con los filtros aplicados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{sale.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{sale.customer || 'Cliente General'}</p>
                        {sale.phone && <p className="text-gray-500 text-xs">{sale.phone}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(sale.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        sale.payment_method === 'efectivo' ? 'bg-green-100 text-green-800' :
                        sale.payment_method === 'tarjeta' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(sale.total || sale.price * sale.quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(sale)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Ver detalles"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleShowReceipt(sale)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Ver recibo"
                      >
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles de venta */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Detalles de Venta #{selectedSale.id}</h3>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-medium">{selectedSale.date || new Date(selectedSale.createdAt).toISOString().split('T')[0]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hora</p>
                  <p className="font-medium">{selectedSale.time || new Date(selectedSale.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{selectedSale.customer || 'Cliente General'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{selectedSale.phone || 'No registrado'}</p>
                </div>
              </div>

              {/* Producto vendido */}
              <div>
                <h4 className="font-semibold mb-3">Producto Vendido</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Producto</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Cantidad</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Precio</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 text-sm">{selectedSale.product}</td>
                        <td className="px-4 py-2 text-sm">{selectedSale.quantity}</td>
                        <td className="px-4 py-2 text-sm">{formatCurrency(selectedSale.price)}</td>
                        <td className="px-4 py-2 text-sm font-medium">{formatCurrency(selectedSale.price * selectedSale.quantity)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <p className="text-sm text-gray-600">Método de Pago</p>
                <p className="font-medium capitalize">{selectedSale.payment_method}</p>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(selectedSale.total || selectedSale.price * selectedSale.quantity)}</span>
              </div>

              {/* Botones */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    handleShowReceipt(selectedSale);
                    setSelectedSale(null);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <FaDownload />
                  <span>Ver Recibo</span>
                </button>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal del recibo */}
      {showReceipt && receiptSale && (
        <SaleReceipt
          sale={receiptSale}
          onClose={handleCloseReceipt}
          onPrint={handlePrintReceipt}
        />
      )}
    </div>
  );
};

export default SalesHistory;