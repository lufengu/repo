import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaEye, FaDownload, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MetricCard } from './index';
import SaleReceipt from './SaleReceipt';
import { TrendingUp, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import { salesAPI } from '../services/salesService';
import { toColombiaDate, formatColombiaShortDate } from '../../../utils/dateColombia';

const SalesHistory = ({ refreshTrigger }) => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estado para guardar los 5 productos más comprados (no se usa en el render)
  const topProductsRef = useRef([]);

  useEffect(() => {
    fetchSales();
  }, []);

  // Efecto para refrescar cuando se crea una nueva venta
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchSales();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    // Filtrar ventas según búsqueda y fecha
    let filtered = sales;

    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.phone?.includes(searchTerm) ||
        sale.cedula?.toString().includes(searchTerm) ||
        sale.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toString().includes(searchTerm) ||
        sale.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(sale => {
        // Ajustar la fecha a Colombia antes de comparar
        const saleDate = toColombiaDate(sale.createdAt).toISOString().split('T')[0];
        return saleDate === dateFilter;
      });
    }

    setFilteredSales(filtered);
    // Resetear página cuando cambian los filtros
    setCurrentPage(1);
  }, [searchTerm, dateFilter, sales]);

  useEffect(() => {
    // Contar productos vendidos
    const productCount = {};

    filteredSales.forEach(sale => {
      // Si la venta tiene items (varios productos)
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(item => {
          productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
        });
      } else if (sale.product) {
        // Formato legacy: un solo producto por venta
        productCount[sale.product] = (productCount[sale.product] || 0) + (sale.quantity || 1);
      }
    });

    // Ordenar y tomar los 5 más vendidos
    const topProducts = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    topProductsRef.current = topProducts;

    // Si quieres ver el resultado en consola (puedes quitar esta línea si no quieres nada visible)
    // console.log('Top 5 productos más comprados:', topProducts);

  }, [filteredSales]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await salesAPI.getSales();
      setSales(data);
      setFilteredSales(data);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setSales([]);
      setFilteredSales([]);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de formato
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return formatColombiaShortDate(dateString);
  };

  // Calcular métricas
  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || sale.price * sale.quantity), 0);
  const totalTransactions = filteredSales.length;
  const totalItemsSold = filteredSales.reduce((sum, sale) => sum + (sale.totalItems || sale.quantity), 0);
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const handleViewDetails = (sale) => setSelectedSale(sale);

  const handleShowReceipt = (sale) => {
    setReceiptSale(sale);
    setShowReceipt(true);
  };

  const handlePrintReceipt = () => window.print();

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptSale(null);
  };

  // Cálculos para paginación
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = filteredSales.slice(startIndex, endIndex);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Generar números de páginas para mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando historial de ventas...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="space-y-4 sm:space-y-6">
      {/* Métricas del historial */}
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        <MetricCard
          title="Total en Ventas"
          value={formatCurrency(totalSales)}
          detail={`${totalTransactions} transacciones`}
          icon={<DollarSign className="w-8 h-8" />}
          gradient="from-blue-500 to-blue-600"
          colorText="text-blue-100"
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
          gradient="from-blue-500 to-blue-600"
          colorText="text-blue-100"
        />
        
        <MetricCard
          title="Ventas Hoy"
          value={filteredSales.filter(s => {
            const today = toColombiaDate(new Date()).toISOString().split('T')[0];
            const saleDate = toColombiaDate(s.createdAt).toISOString().split('T')[0];
            return saleDate === today;
          }).length.toString()}
          detail="Transacciones realizadas"
          icon={<Calendar className="w-8 h-8" />}
          gradient="from-blue-500 to-blue-600"
          colorText="text-blue-100"
        />
      </div>

      {/* Filtros */}
  <div className="bg-white rounded-lg shadow p-2 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Filtrar Ventas</h3>
  <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-4">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por producto, cliente, teléfono o método de pago..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative w-full">
            <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Selector de elementos por página */}
          <div className="flex flex-wrap items-center space-x-2 w-full">
            <label className="text-sm text-gray-600">Mostrar:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">por página</span>
          </div>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="bg-white rounded-lg shadow p-2 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2">
          <h3 className="text-lg font-semibold">Historial de Ventas ({filteredSales.length})</h3>
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredSales.length)} de {filteredSales.length} ventas
          </div>
        </div>
        {filteredSales.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No hay ventas registradas aún</p>
            <p className="text-sm">o no se encontraron ventas con los filtros aplicados</p>
          </div>
        ) : (
          <>
            {/* Vista tipo card en móvil, tabla en desktop */}
            <div className="block lg:hidden space-y-4">
              {currentSales.map((sale) => (
                <div key={sale.id} className="rounded-xl border border-gray-200 shadow-sm p-4 bg-white flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-orange-600">#{sale.id}</span>
                    <span className="text-xs text-gray-500">{formatDate(sale.createdAt)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Cliente: {sale.customer || 'Cliente General'}</span>
                      {sale.cedula && <span className="text-xs text-gray-400">Cédula: {sale.cedula}</span>}
                      {sale.direccion && <span className="text-xs text-gray-400">Dir: {sale.direccion}</span>}
                      {sale.phone && <span className="text-xs text-gray-400">Tel: {sale.phone}</span>}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">Pago: <span className="font-semibold capitalize">{sale.payment_method}</span></span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-green-600 text-lg">{formatCurrency(sale.total || sale.price * sale.quantity)}</span>
                    <div className="flex gap-2">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:block w-full overflow-x-auto">
              <table className="min-w-[700px] w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{sale.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        <div>
                          <p className="font-medium">{sale.customer || 'Cliente General'}</p>
                          {sale.cedula && <p className="text-gray-500 text-xs">Cédula: {sale.cedula}</p>}
                          {sale.direccion && <p className="text-gray-500 text-xs">Dir: {sale.direccion}</p>}
                          {sale.phone && <p className="text-gray-500 text-xs">{sale.phone}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{sale.payment_method}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(sale.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">{formatCurrency(sale.total || sale.price * sale.quantity)}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium space-x-2">
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
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">
                  <span>Página {currentPage} de {totalPages}</span>
                </div>
                <div className="flex flex-wrap items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <FaChevronLeft className="w-4 h-4" />
                  </button>
                  {getPageNumbers().map((pageNumber, index) => (
                    <button
                      key={index}
                      onClick={() => pageNumber !== '...' && handlePageChange(pageNumber)}
                      disabled={pageNumber === '...'}
                      className={`px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${pageNumber === currentPage ? 'bg-orange-500 text-white' : pageNumber === '...' ? 'text-gray-400 cursor-default' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <FaChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de detalles de venta */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-0">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xs sm:max-w-2xl mx-1 sm:mx-4 max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">Detalles de Venta #{selectedSale.id}</h3>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gray-400 hover:text-gray-600"
                  style={{ color: '#000' }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-2 sm:p-6 space-y-4 sm:space-y-6 text-black">
              {/* Información general */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                <div>
                  <p className="text-sm" style={{ color: '#000' }}>Fecha</p>
                  <p className="font-medium" style={{ color: '#000' }}>
                    {new Date(selectedSale.createdAt).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#000' }}>Cliente</p>
                  <p className="font-medium" style={{ color: '#000' }}>{selectedSale.customer || 'Cliente General'}</p>
                </div>
                
                <div>
                  <p className="text-sm" style={{ color: '#000' }}>Email</p>
                  <p className="font-medium" style={{ color: '#000' }}>{selectedSale.email || 'No registrado'}</p>
                </div>
              </div>

              {/* Producto vendido */}
              <div>
                <h4 className="font-semibold mb-3 text-black">Detalles de la compra:</h4>
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="min-w-[300px] w-full text-xs sm:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-black">Producto</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-black">Cantidad</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-black">Precio Unitario</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-black">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedSale.items && Array.isArray(selectedSale.items) ? (
                        // Nuevo formato con múltiples productos
                        selectedSale.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: '#000' }}>{item.name}</td>
                            <td className="px-4 py-3 text-sm text-center" style={{ color: '#000' }}>{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right" style={{ color: '#000' }}>{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-right" style={{ color: '#000' }}>{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))
                      ) : (
                        // Formato legacy para compatibilidad
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: '#000' }}>{selectedSale.product}</td>
                          <td className="px-4 py-3 text-sm text-center" style={{ color: '#000' }}>{selectedSale.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right" style={{ color: '#000' }}>{formatCurrency(selectedSale.price)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-right" style={{ color: '#000' }}>{formatCurrency(selectedSale.price * selectedSale.quantity)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <p className="text-sm" style={{ color: '#000' }}>Método de Pago</p>
                <p className="font-medium capitalize" style={{ color: '#000' }}>{selectedSale.payment_method}</p>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-black">Total:</span>
                <span className="text-2xl font-bold text-green-600" style={{ color: '#000' }}>
                  {formatCurrency(selectedSale.total || selectedSale.price * selectedSale.quantity)}
                </span>
              </div>

              {/* Botones */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
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