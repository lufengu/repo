import { useState, useEffect } from 'react';
import { FaFileDownload, FaFileCsv, FaFilePdf, FaCalendarAlt, FaClock, FaChartLine } from 'react-icons/fa';
import { MetricCard } from './index';
import { BarChart, LineChart, TrendingUp, Calendar, DollarSign, FileText } from 'lucide-react';
// import { salesAPI } from '../services/ventasService'; // Descomenta cuando tengas el servicio
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const SalesReports = () => {
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState({
    dailyReport: null,
    monthlyReport: null,
    salesByProduct: [],
    salesByPaymentMethod: [],
    trends: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateReports();
  }, [reportPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date();
      let startDate, endDate;

      if (reportPeriod === 'daily') {
        startDate = endDate = today.toISOString().split('T')[0];
      } else if (reportPeriod === 'monthly') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      } else if (reportPeriod === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        startDate = customDateRange.startDate;
        endDate = customDateRange.endDate;
      }

      // Cuando tengas la API, descomenta esto:
      // const sales = await salesAPI.getSalesByDateRange(startDate, endDate);
      
      // Mientras tanto, usar datos de ejemplo:
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular carga
      
      if (reportPeriod === 'daily') {
        generateDailyReport();
      } else {
        generateMonthlyReport();
      }
    } catch (error) {
      console.error('Error generando reportes:', error);
      setError('Error al generar los reportes. Usando datos de ejemplo.');
      generateExampleReports();
    } finally {
      setLoading(false);
    }
  };

  const generateDailyReport = () => {
    // Datos de ejemplo para reporte diario
    const mockDailyData = {
      dailyReport: {
        date: new Date().toLocaleDateString('es-CO'),
        totalSales: 1095000,
        totalTransactions: 8,
        averageTicket: 136875,
        hourlyData: [
          { hour: '09:00', sales: 155000, transactions: 1 },
          { hour: '11:00', sales: 90000, transactions: 1 },
          { hour: '14:00', sales: 850000, transactions: 1 },
          { hour: '16:00', sales: 0, transactions: 5 }
        ]
      },
      salesByProduct: [
        { product: 'Laptop HP', quantity: 1, revenue: 850000 },
        { product: 'Mouse Logitech', quantity: 2, revenue: 155000 },
        { product: 'Teclado Gaming', quantity: 1, revenue: 90000 }
      ],
      salesByPaymentMethod: [
        { method: 'tarjeta', count: 3, total: 850000 },
        { method: 'transferencia', count: 2, total: 155000 },
        { method: 'efectivo', count: 3, total: 90000 }
      ],
      trends: [
        { hour: '09:00', sales: 155000, transactions: 1 },
        { hour: '11:00', sales: 90000, transactions: 1 },
        { hour: '14:00', sales: 850000, transactions: 1 },
        { hour: '16:00', sales: 0, transactions: 5 }
      ]
    };

    setReportData(mockDailyData);
  };

  const generateMonthlyReport = () => {
    // Datos de ejemplo para reporte mensual
    const mockMonthlyData = {
      monthlyReport: {
        month: new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
        totalSales: 12450000,
        totalTransactions: 156,
        dailyAverage: 402000
      },
      salesByProduct: [
        { product: 'Laptop HP', quantity: 15, revenue: 6500000 },
        { product: 'Mouse Logitech', quantity: 28, revenue: 2800000 },
        { product: 'Teclado Gaming', quantity: 18, revenue: 1950000 },
        { product: 'Monitor 24"', quantity: 8, revenue: 1200000 }
      ],
      salesByPaymentMethod: [
        { method: 'tarjeta', count: 68, total: 7200000 },
        { method: 'transferencia', count: 45, total: 3600000 },
        { method: 'efectivo', count: 43, total: 1650000 }
      ],
      trends: [
        { day: 1, sales: 450000, transactions: 6 },
        { day: 2, sales: 380000, transactions: 4 },
        { day: 3, sales: 620000, transactions: 8 },
        { day: 4, sales: 1095000, transactions: 12 },
        { day: 5, sales: 890000, transactions: 10 },
        { day: 6, sales: 720000, transactions: 9 }
      ]
    };

    setReportData(mockMonthlyData);
  };

  const generateExampleReports = () => {
    if (reportPeriod === 'daily') {
      generateDailyReport();
    } else {
      generateMonthlyReport();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportReport = () => {
    const reportContent = {
      periodo: reportPeriod === 'daily' ? 'Diario' : 'Mensual',
      fecha: new Date().toLocaleDateString('es-CO'),
      datos: reportData
    };

    const dataStr = JSON.stringify(reportContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ventas-${reportPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const periodo = reportPeriod === 'daily' ? 'Diario' : 'Mensual';
    const fecha = new Date().toLocaleDateString('es-CO');
    const rows = [];
    
    if (reportPeriod === 'daily') {
      reportData.trends.filter(h => h.sales > 0).forEach(h => {
        rows.push([periodo, fecha, h.hour, h.transactions, h.sales, (h.sales / h.transactions).toFixed(0)]);
      });
    } else {
      reportData.trends.forEach(d => {
        rows.push([periodo, fecha, `Día ${d.day}`, d.transactions, d.sales, (d.sales / d.transactions).toFixed(0)]);
      });
    }
    
    const header = ['Periodo', 'Fecha', 'Hora/Día', 'Transacciones', 'Ventas', 'Promedio'];
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ventas-${reportPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      const periodo = reportPeriod === 'daily' ? 'Diario' : 'Mensual';
      
      // Título principal
      doc.setFontSize(18);
      doc.text(`Reporte de Ventas - ${periodo}`, 14, 20);
      
      // Fecha
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 30);

      const head = [['Hora/Día', 'Transacciones', 'Ventas', 'Promedio']];
      const body = reportPeriod === 'daily'
        ? reportData.trends.filter(h => h.sales > 0).map(h => [
            h.hour,
            h.transactions,
            formatCurrency(h.sales),
            formatCurrency(h.transactions ? h.sales / h.transactions : 0)
          ])
        : reportData.trends.map(d => [
            `Día ${d.day}`,
            d.transactions,
            formatCurrency(d.sales),
            formatCurrency(d.transactions ? d.sales / d.transactions : 0)
          ]);

      autoTable(doc, { 
        head, 
        body, 
        startY: 40,
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [255, 102, 0] // Color naranja
        }
      });
      
      doc.save(`reporte-ventas-${reportPeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generando reportes...</p>
        </div>
      </div>
    );
  }

  const currentReport = reportPeriod === 'daily' ? reportData.dailyReport : reportData.monthlyReport;

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Reportes de Ventas</h2>
            <p className="text-gray-600">Analiza el rendimiento de tus ventas con reportes detallados</p>
          </div>
          
          {/* Controles de período */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setReportPeriod('daily')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportPeriod === 'daily'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FaClock className="inline mr-2" />
              Hoy
            </button>
            <button
              onClick={() => setReportPeriod('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportPeriod === 'monthly'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FaCalendarAlt className="inline mr-2" />
              Este Mes
            </button>
          </div>
        </div>

        {/* Botones de exportación */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaFileCsv className="mr-2" />
              Exportar CSV
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaFilePdf className="mr-2" />
              Exportar PDF
            </button>
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaFileDownload className="mr-2" />
              Exportar JSON
            </button>
          </div>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Métricas principales */}
      {currentReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={reportPeriod === 'daily' ? 'Ventas del Día' : 'Ventas del Mes'}
            value={formatCurrency(currentReport.totalSales)}
            detail={reportPeriod === 'daily' ? currentReport.date : currentReport.month}
            icon={<DollarSign className="w-8 h-8" />}
            gradient="from-green-500 to-green-600"
            colorText="text-green-100"
          />
          
          <MetricCard
            title="Total Transacciones"
            value={currentReport.totalTransactions.toString()}
            detail={reportPeriod === 'daily' ? 'transacciones hoy' : 'transacciones del mes'}
            icon={<BarChart className="w-8 h-8" />}
            gradient="from-blue-500 to-blue-600"
            colorText="text-blue-100"
          />
          
          <MetricCard
            title={reportPeriod === 'daily' ? 'Ticket Promedio' : 'Promedio Diario'}
            value={formatCurrency(reportPeriod === 'daily' ? currentReport.averageTicket : currentReport.dailyAverage)}
            detail={reportPeriod === 'daily' ? 'por transacción' : 'por día'}
            icon={<TrendingUp className="w-8 h-8" />}
            gradient="from-purple-500 to-purple-600"
            colorText="text-purple-100"
          />
          
          <MetricCard
            title={reportPeriod === 'daily' ? 'Hora Pico' : 'Mejor Día'}
            value={reportPeriod === 'daily' 
              ? reportData.trends.sort((a, b) => b.sales - a.sales)[0]?.hour || 'N/A'
              : `Día ${reportData.trends.sort((a, b) => b.sales - a.sales)[0]?.day || 'N/A'}`
            }
            detail="Mayor actividad"
            icon={<Calendar className="w-8 h-8" />}
            gradient="from-orange-500 to-orange-600"
            colorText="text-orange-100"
          />
        </div>
      )}

      {/* Reporte detallado por tiempo */}
      {reportData.trends && reportData.trends.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FaChartLine className="text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">
                {reportPeriod === 'daily' ? 'Ventas por Hora' : 'Ventas por Día'}
              </h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {reportPeriod === 'daily' ? 'Hora' : 'Día del Mes'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transacciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(reportPeriod === 'daily' 
                  ? reportData.trends.filter(h => h.sales > 0) 
                  : reportData.trends
                ).map((timeData, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reportPeriod === 'daily' ? timeData.hour : `Día ${timeData.day}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(timeData.sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {timeData.transactions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(timeData.transactions > 0 ? timeData.sales / timeData.transactions : 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{
                              width: `${(timeData.sales / Math.max(...reportData.trends.map(t => t.sales))) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs">
                          {currentReport && ((timeData.sales / currentReport.totalSales) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Productos más vendidos */}
      {reportData.salesByProduct && reportData.salesByProduct.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Productos Más Vendidos {reportPeriod === 'daily' ? 'del Día' : 'del Mes'}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % del Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.salesByProduct.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.quantity} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {currentReport && ((product.revenue / currentReport.totalSales) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Métodos de pago */}
      {reportData.salesByPaymentMethod && reportData.salesByPaymentMethod.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Métodos de Pago {reportPeriod === 'daily' ? 'del Día' : 'del Mes'}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transacciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % del Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.salesByPaymentMethod.map((method, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        method.method === 'efectivo' ? 'bg-green-100 text-green-800' :
                        method.method === 'tarjeta' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {method.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {method.count} transacciones
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(method.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {currentReport && ((method.total / currentReport.totalSales) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReports;