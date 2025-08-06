import { useState, useEffect } from 'react';
import { FaBars, FaPlus, FaSearch, FaReceipt, FaDownload, FaEye } from "react-icons/fa";
import { MetricCard } from '../components';
import { DollarSign, CreditCard, Users, TrendingUp, Package, Calendar, Filter } from 'lucide-react';
import Menu from "../../dashboard/components/Menu";
import { SalesRegisterForm, SalesReports, SaleReceipt } from '../components';
import { salesAPI } from '../services/ventasService';

const VentasModern = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('ventas');
  const [currentView, setCurrentView] = useState('sales'); // 'sales', 'reports'
  const [userName, setUserName] = useState('Usuario');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('today'); // 'today', 'week', 'month', 'all'

  // Datos de ejemplo para las métricas
  const [metrics, setMetrics] = useState({
    totalToday: 1095000,
    transactions: 3,
    averageSale: 365000,
    cashSales: 1
  });

  useEffect(() => {
    const loadInitialData = async () => {
      // Obtener información del usuario desde localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const name = user.name || user.nombre || user.firstName || user.username || 'Usuario';
          setUserName(name);
        } catch (error) {
          console.error('Error al parsear datos del usuario:', error);
          setUserName('Usuario');
        }
      }
      
      // Cargar datos de ventas
      await fetchSales();
    };
    
    loadInitialData();
  }, []); // Solo se ejecuta una vez al montar el componente

  const fetchSales = async () => {
    try {
      setLoading(true);
      // Descomentar cuando tengas la API funcionando:
      // const data = await salesAPI.getSales();
      // setSales(data);
      // calculateMetrics(data);
      
      // Datos de ejemplo más completos
      const exampleSales = [
        {
          id: 'V001',
          items: [
            { product: 'Laptop HP', quantity: 1, price: 850000 }
          ],
          total: 850000,
          payment_method: 'tarjeta',
          paymentMethod: 'tarjeta',
          createdAt: '2025-08-06T14:30:00Z',
          customer: 'Juan Pérez',
          phone: '+57 300 123 4567',
          email: 'juan@email.com'
        },
        {
          id: 'V002',
          items: [
            { product: 'Mouse Gamer', quantity: 2, price: 45000 },
            { product: 'Teclado Gaming', quantity: 1, price: 90000 }
          ],
          total: 180000,
          payment_method: 'efectivo',
          paymentMethod: 'efectivo',
          createdAt: '2025-08-06T13:15:00Z',
          customer: 'María López',
          phone: '+57 310 987 6543',
          email: 'maria@email.com'
        },
        {
          id: 'V003',
          items: [
            { product: 'Mouse Logitech', quantity: 1, price: 85000 }
          ],
          total: 85000,
          payment_method: 'transferencia',
          paymentMethod: 'transferencia',
          createdAt: '2025-08-06T12:00:00Z',
          customer: 'Cliente General',
          phone: '',
          email: ''
        },
        {
          id: 'V004',
          items: [
            { product: 'Monitor 24"', quantity: 1, price: 800000 }
          ],
          total: 800000,
          payment_method: 'nequi',
          paymentMethod: 'nequi',
          createdAt: '2025-08-05T16:45:00Z',
          customer: 'Carlos Ruiz',
          phone: '+57 320 456 7890',
          email: 'carlos@email.com'
        },
        {
          id: 'V005',
          items: [
            { product: 'Webcam HD', quantity: 2, price: 160000 }
          ],
          total: 320000,
          payment_method: 'daviplata',
          paymentMethod: 'daviplata',
          createdAt: '2025-08-05T11:20:00Z',
          customer: 'Ana Torres',
          phone: '+57 315 234 5678',
          email: 'ana@email.com'
        }
      ];
      
      setSales(exampleSales);
      calculateMetrics(exampleSales);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      // En caso de error, usar datos básicos
      setSales([]);
      setMetrics({
        totalToday: 0,
        transactions: 0,
        averageSale: 0,
        cashSales: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (salesData) => {
    const today = new Date().toDateString();
    const todaySales = salesData.filter(sale => 
      new Date(sale.createdAt).toDateString() === today
    );

    const totalToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const transactions = todaySales.length;
    const averageSale = transactions > 0 ? totalToday / transactions : 0;
    const cashSales = todaySales.filter(sale => sale.payment_method === 'efectivo').length;

    setMetrics({
      totalToday,
      transactions,
      averageSale,
      cashSales
    });
  };

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
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      'tarjeta': 'bg-blue-100 text-blue-800',
      'efectivo': 'bg-green-100 text-green-800',
      'transferencia': 'bg-purple-100 text-purple-800',
      'nequi': 'bg-indigo-100 text-indigo-800',
      'daviplata': 'bg-orange-100 text-orange-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const getDateFilterLabel = (filter) => {
    const labels = {
      'today': 'Hoy',
      'week': 'Esta semana',
      'month': 'Este mes',
      'all': 'Todas'
    };
    return labels[filter] || 'Todas';
  };

  const filterSalesByDate = (sale) => {
    const saleDate = new Date(sale.createdAt);
    const today = new Date();
    
    switch (dateFilter) {
      case 'today':
        return saleDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return saleDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return saleDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredSales = sales
    .filter(filterSalesByDate)
    .filter(sale => {
      const productMatch = sale.items?.some(item => 
        item.product.toLowerCase().includes(searchTerm.toLowerCase())
      ) || false;
      const customerMatch = sale.customer && 
        sale.customer.toLowerCase().includes(searchTerm.toLowerCase());
      return productMatch || customerMatch;
    })
    .filter(sale =>
      paymentMethodFilter === '' || sale.payment_method === paymentMethodFilter
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getProductsDisplay = (items) => {
    if (!items || items.length === 0) return 'Sin productos';
    
    if (items.length === 1) {
      return `${items[0].product} x${items[0].quantity}`;
    }
    
    return `${items[0].product} x${items[0].quantity} +${items.length - 1} más`;
  };

  const handleNewSaleSuccess = (newSale) => {
    setShowRegisterModal(false);
    // Agregar la nueva venta al estado
    setSales(prevSales => [newSale, ...prevSales]);
    calculateMetrics([newSale, ...sales]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Menu lateral */}
      <Menu 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header superior */}
        <header className="bg-white shadow-sm p-6 border-b">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaBars size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Ventas</h1>
                <p className="text-sm text-gray-600">Administra y controla todas tus ventas</p>
                <p className="text-sm text-gray-500">Bienvenido, {userName}</p>
              </div>
            </div>
            
            {/* Controles de vista */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('sales')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'sales'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Package className="inline w-4 h-4 mr-2" />
                  Ventas
                </button>
                <button
                  onClick={() => setCurrentView('reports')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'reports'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <TrendingUp className="inline w-4 h-4 mr-2" />
                  Reportes
                </button>
              </div>
              
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <FaPlus size={14} />
                <span>Nueva Venta</span>
              </button>
            </div>
          </div>
        </header>

        {/* Contenido del dashboard */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentView === 'sales' ? (
            <>
              {/* Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                  title="Ventas del Día"
                  value={formatCurrency(metrics.totalToday)}
                  detail={`${metrics.transactions} ventas hoy`}
                  icon={<DollarSign className="w-8 h-8" />}
                  gradient="from-green-500 to-green-600"
                  colorText="text-green-100"
                />
                <MetricCard
                  title="Transacciones"
                  value={metrics.transactions.toString()}
                  detail="Operaciones realizadas"
                  icon={<CreditCard className="w-8 h-8" />}
                  gradient="from-blue-500 to-blue-600"
                  colorText="text-blue-100"
                />
                <MetricCard
                  title="Venta Promedio"
                  value={formatCurrency(metrics.averageSale)}
                  detail="Por transacción"
                  icon={<TrendingUp className="w-8 h-8" />}
                  gradient="from-purple-500 to-purple-600"
                  colorText="text-purple-100"
                />
                <MetricCard
                  title="Ventas en Efectivo"
                  value={metrics.cashSales.toString()}
                  detail="Pagos en efectivo"
                  icon={<Users className="w-8 h-8" />}
                  gradient="from-orange-500 to-orange-600"
                  colorText="text-orange-100"
                />
              </div>

              {/* Historial de Ventas */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    <h2 className="text-xl font-bold text-gray-900">Historial de Ventas</h2>
                    
                    {/* Filtros */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                      {/* Búsqueda */}
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="text"
                          placeholder="Buscar producto o cliente..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
                        />
                      </div>
                      
                      {/* Filtro de fecha */}
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="today">Hoy</option>
                        <option value="week">Esta semana</option>
                        <option value="month">Este mes</option>
                        <option value="all">Todas</option>
                      </select>
                      
                      {/* Filtro de método de pago */}
                      <select
                        value={paymentMethodFilter}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                        className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Todos los pagos</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="nequi">Nequi</option>
                        <option value="daviplata">Daviplata</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Información de filtros activos */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Búsqueda: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {paymentMethodFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Pago: {paymentMethodFilter}
                        <button
                          onClick={() => setPaymentMethodFilter('')}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {dateFilter !== 'all' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Fecha: {getDateFilterLabel(dateFilter)}
                      </span>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando historial de ventas...</p>
                  </div>
                ) : filteredSales.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron ventas con los filtros aplicados</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setPaymentMethodFilter('');
                        setDateFilter('all');
                      }}
                      className="mt-2 text-orange-600 hover:text-orange-800 text-sm"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método Pago</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{sale.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(sale.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div className="font-medium">{sale.customer || 'Cliente General'}</div>
                                {sale.phone && (
                                  <div className="text-xs text-gray-500">{sale.phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <div title={sale.items?.map(item => `${item.product} x${item.quantity}`).join(', ')}>
                                {getProductsDisplay(sale.items)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(sale.payment_method)}`}>
                                {sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                              {formatCurrency(sale.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedSale(sale);
                                    setShowReceiptModal(true);
                                  }}
                                  className="text-orange-600 hover:text-orange-800 flex items-center space-x-1 transition-colors"
                                  title="Ver recibo"
                                >
                                  <FaEye size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedSale(sale);
                                    setShowReceiptModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors"
                                  title="Imprimir recibo"
                                >
                                  <FaReceipt size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Resumen de resultados */}
                {!loading && filteredSales.length > 0 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>
                        Mostrando {filteredSales.length} de {sales.length} ventas
                      </span>
                      <span>
                        Total: {formatCurrency(filteredSales.reduce((sum, sale) => sum + sale.total, 0))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <SalesReports />
          )}
        </main>
      </div>

      {/* Modal de Nueva Venta */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Nueva Venta</h2>
                <button 
                  onClick={() => setShowRegisterModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <SalesRegisterForm onSuccess={handleNewSaleSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recibo */}
      {showReceiptModal && selectedSale && (
        <SaleReceipt
          sale={selectedSale}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedSale(null);
          }}
          onPrint={() => {
            window.print();
          }}
        />
      )}
    </div>
  );
};

export default VentasModern;