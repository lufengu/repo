import { useState, useEffect } from 'react';
import { FaFileDownload, FaFileCsv, FaFilePdf, FaCalendarAlt, FaClock, FaChartLine } from 'react-icons/fa';
import { MetricCard } from './index';
import { BarChart, LineChart, TrendingUp, Calendar, DollarSign, FileText } from 'lucide-react';
import { salesAPI } from '../services/salesService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoCompleto from '../../../assets/logoCompleto.png';

const SalesReports = () => {
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [customDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState({
    dailyReport: null,
    monthlyReport: null,
    salesByProduct: [],
    salesByPaymentMethod: [],
    trends: [],
    maxSalesByMonth: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateReports();
  }, [reportPeriod]); 

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

      // Obtener ventas reales del historial
      const sales = await salesAPI.getSales();
      // Filtrar por rango de fechas
      const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
        return saleDate >= startDate && saleDate <= endDate;
      });

      // Calcular métricas principales
      const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || sale.price * sale.quantity), 0);
      const totalTransactions = filteredSales.length;
      const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

      // Agrupar ventas por hora/día
      let trends = [];
      if (reportPeriod === 'daily') {
        trends = [];
      } else {
        // Agrupar por día del mes
        const days = {};
        filteredSales.forEach(sale => {
          const day = new Date(sale.createdAt).getDate();
          if (!days[day]) days[day] = { day, sales: 0, transactions: 0 };
          days[day].sales += sale.total || sale.price * sale.quantity;
          days[day].transactions += 1;
        });
        trends = Object.values(days).sort((a, b) => a.day - b.day);
      }

      // Productos más vendidos
      const productCount = {};
      filteredSales.forEach(sale => {
        if (sale.items && Array.isArray(sale.items)) {
          sale.items.forEach(item => {
            if (!productCount[item.name]) productCount[item.name] = { product: item.name, quantity: 0, revenue: 0 };
            productCount[item.name].quantity += item.quantity;
            productCount[item.name].revenue += item.price * item.quantity;
          });
        } else if (sale.product) {
          if (!productCount[sale.product]) productCount[sale.product] = { product: sale.product, quantity: 0, revenue: 0 };
          productCount[sale.product].quantity += sale.quantity || 1;
          productCount[sale.product].revenue += (sale.price || 0) * (sale.quantity || 1);
        }
      });
      const salesByProduct = Object.values(productCount).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

      // Métodos de pago
      const paymentMethodCount = {};
      filteredSales.forEach(sale => {
        const method = sale.payment_method || 'desconocido';
        if (!paymentMethodCount[method]) paymentMethodCount[method] = { method, count: 0, total: 0 };
        paymentMethodCount[method].count += 1;
        paymentMethodCount[method].total += sale.total || sale.price * sale.quantity;
      });
      const salesByPaymentMethod = Object.values(paymentMethodCount);

      // Calcular máximo de ventas por mes (solo para periodo mensual)
      let maxSalesByMonth = [];
      if (reportPeriod === 'monthly') {
        // Agrupar todas las ventas por mes del año actual
        const months = Array.from({ length: 12 }, (_, i) => ({
          month: i,
          name: new Date(2000, i, 1).toLocaleString('es-CO', { month: 'long' }),
          totalSales: 0,
          transactions: 0
        }));
        sales.forEach(sale => {
          const date = new Date(sale.createdAt);
          if (date.getFullYear() === today.getFullYear()) {
            const m = date.getMonth();
            months[m].totalSales += sale.total || sale.price * sale.quantity;
            months[m].transactions += 1;
          }
        });
        maxSalesByMonth = months;
      }

      // Reporte principal
      if (reportPeriod === 'daily') {
        setReportData({
          dailyReport: {
            date: new Date().toLocaleDateString('es-CO'),
            totalSales,
            totalTransactions,
            averageTicket,
          },
          monthlyReport: null,
          salesByProduct,
          salesByPaymentMethod,
          trends: [], // No hay tendencias por hora poner en fase 2
          maxSalesByMonth: []
        });
      } else {
        setReportData({
          dailyReport: null,
          monthlyReport: {
            month: new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
            totalSales,
            totalTransactions,
            dailyAverage: trends.length > 0 ? totalSales / trends.length : 0,
          },
          salesByProduct,
          salesByPaymentMethod,
          trends,
          maxSalesByMonth
        });
      }
    } catch (error) {
      console.error('Error generando reportes:', error);
      setError('Error al generar los reportes.');
      setReportData({
        dailyReport: null,
        monthlyReport: null,
        salesByProduct: [],
        salesByPaymentMethod: [],
        trends: [],
        maxSalesByMonth: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const IVA_RATE = 0.19;

  const buildDetailedSales = (sales) => {
    return sales.map(sale => {
      // Calcular subtotal sin IVA por venta
      let subtotalSinIVA = 0;
      let detalles = [];
      if (sale.items && Array.isArray(sale.items)) {
        detalles = sale.items.map(item => {
          const subtotalItem = item.price * item.quantity;
          const ivaItem = subtotalItem * IVA_RATE;
          const totalItem = subtotalItem + ivaItem;
          subtotalSinIVA += subtotalItem;
          return {
            producto: item.name,
            cantidad: item.quantity,
            precio_unitario: item.price,
            subtotal_sin_iva: subtotalItem,
            iva: ivaItem,
            subtotal_con_iva: totalItem
          };
        });
      } else if (sale.product) {
        const subtotalItem = (sale.price || 0) * (sale.quantity || 1);
        const ivaItem = subtotalItem * IVA_RATE;
        const totalItem = subtotalItem + ivaItem;
        subtotalSinIVA += subtotalItem;
        detalles = [{
          producto: sale.product,
          cantidad: sale.quantity || 1,
          precio_unitario: sale.price || 0,
          subtotal_sin_iva: subtotalItem,
          iva: ivaItem,
          subtotal_con_iva: totalItem
        }];
      }
      const ivaVenta = subtotalSinIVA * IVA_RATE;
      const totalConIVA = subtotalSinIVA + ivaVenta;

      return {
        fecha: new Date(sale.createdAt).toLocaleDateString('es-CO'),
        cliente: (sale.customer && sale.customer.toString().trim()) ? sale.customer : 'N/A',
        cedula: (sale.cedula && sale.cedula.toString().trim()) ? sale.cedula : 'N/A',
        direccion: (sale.direccion && sale.direccion.toString().trim()) ? sale.direccion : 'N/A',
        correo: (sale.email && sale.email.toString().trim()) ? sale.email : ((sale.correo && sale.correo.toString().trim()) ? sale.correo : 'N/A'),
        detalles,
        metodo_pago: sale.payment_method || 'N/A',
        subtotal_sin_iva: subtotalSinIVA,
        iva: ivaVenta,
        total_con_iva: totalConIVA
      };
    });
  };

  // Helper: cargar imagen y devolver dataURL + dimensiones
  const loadImageDataUrl = (src) =>
    new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = (e) => reject(e);
        img.src = src;
      } catch (e) {
        reject(e);
      }
    });

  const exportReport = async () => {
    try {
      const sales = await salesAPI.getSales();
      const detailedSales = buildDetailedSales(sales);

      const reportContent = {
        fecha_exportacion: new Date().toLocaleString('es-CO'),
        ventas: detailedSales
      };

      const dataStr = JSON.stringify(reportContent, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-detallado-ventas-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error al exportar JSON');
    }
  };

  const exportCSV = async () => {
    try {
      const sales = await salesAPI.getSales();
      const detailedSales = buildDetailedSales(sales);

  let csv = 'Fecha,Cliente,Cédula,Dirección,Correo,Producto,Cantidad,Precio Unitario,Subtotal sin IVA,IVA (19%),Subtotal con IVA,Método de Pago,Subtotal Venta sin IVA,IVA Venta,Total Venta con IVA\n';
      detailedSales.forEach(sale => {
        sale.detalles.forEach(item => {
  csv += `"${sale.fecha}","${sale.cliente}","${sale.cedula}","${sale.direccion}","${sale.correo}","${item.producto}",${item.cantidad},${item.precio_unitario},${item.subtotal_sin_iva},${item.iva},${item.subtotal_con_iva},"${sale.metodo_pago}",${sale.subtotal_sin_iva},${sale.iva},${sale.total_con_iva}\n`;
        });
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-detallado-ventas-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error al exportar CSV');
    }
  };

  const exportPDF = async () => {
    try {
      const sales = await salesAPI.getSales();
      const detailedSales = buildDetailedSales(sales);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const title = 'REPORTE DETALLADO DE VENTAS';

      // posición inicial para el contenido después del encabezado
      let y = 35;

      // intentar cargar y dibujar logo centrado encima del título
      try {
        const imgInfo = await loadImageDataUrl(logoCompleto);
  const maxImgWidth = Math.min(pageWidth * 0.4, 140);
  const scale = Math.min(1, maxImgWidth / imgInfo.width);
  // reducir tamaño adicionalmente un 30%
  const reductionFactor = 0.7;
  const imgW = imgInfo.width * scale * reductionFactor;
  const imgH = imgInfo.height * scale * reductionFactor;
        const imgX = (pageWidth - imgW) / 2;
        doc.addImage(imgInfo.dataUrl, 'PNG', imgX, 8, imgW, imgH);
        const titleY = 8 + imgH + 6;
        doc.setFontSize(16);
        const textWidth = doc.getTextWidth(title);
        const x = (pageWidth - textWidth) / 2;
        doc.text(title, x, titleY);
        const fechaHora = new Date().toLocaleString('es-CO');
        doc.setFontSize(10);
        doc.text(`Generado el: ${fechaHora}`, 14, titleY + 7);
        y = titleY + 14;
  } catch {
        doc.setFontSize(16);
        const textWidth = doc.getTextWidth(title);
        const x = (pageWidth - textWidth) / 2;
        doc.text(title, x, 18);
        const fechaHora = new Date().toLocaleString('es-CO');
        doc.setFontSize(10);
        doc.text(`Generado el: ${fechaHora}`, 14, 25);
        y = 35;
      }

      detailedSales.forEach((sale) => {
        let blockHeight = 90 + (sale.detalles.length * 12);
        if (y + blockHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 18;
        }
        doc.setFillColor(255, 243, 230);
        doc.setDrawColor(255, 115, 0);
        doc.roundedRect(10, y - 4, doc.internal.pageSize.getWidth() - 20, blockHeight, 4, 4, 'FD');

        let innerY = y + 4;
        doc.setFontSize(12);
        doc.text(`Fecha: ${sale.fecha}`, 14, innerY);
        doc.text(`Cliente: ${sale.cliente}`, 14, innerY + 6);
        doc.text(`Cédula: ${sale.cedula}`, 14, innerY + 12);
        doc.text(`Dirección: ${sale.direccion}`, 14, innerY + 18);
        doc.text(`Correo: ${sale.correo}`, 14, innerY + 24);

        autoTable(doc, {
          startY: innerY + 36,
          margin: { left: 14, right: 14 },
          head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal sin IVA', 'IVA (19%)', 'Subtotal con IVA']],
          body: sale.detalles.map(item => [
            item.producto,
            item.cantidad,
            `$${item.precio_unitario.toLocaleString('es-CO')}`,
            `$${item.subtotal_sin_iva.toLocaleString('es-CO')}`,
            `$${item.iva.toLocaleString('es-CO')}`,
            `$${item.subtotal_con_iva.toLocaleString('es-CO')}`
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [255, 115, 0],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11,
            halign: 'center',
            valign: 'middle',
            lineWidth: 0.5,
            lineColor: [255, 115, 0]
          },
          bodyStyles: {
            fontSize: 10,
            textColor: [60, 60, 60],
            lineWidth: 0.2,
            lineColor: [220, 220, 220]
          },
          alternateRowStyles: {
            fillColor: [255, 243, 230]
          },
          styles: {
            cellPadding: 2,
            halign: 'center',
            valign: 'middle',
            minCellHeight: 8,
            font: 'helvetica'
          }
        });

        let tableEndY = doc.lastAutoTable.finalY;
        doc.setFontSize(11);
        doc.text(`Subtotal sin IVA: $${sale.subtotal_sin_iva.toLocaleString('es-CO')}`, 14, tableEndY + 6);
        doc.text(`IVA (19%): $${sale.iva.toLocaleString('es-CO')}`, 14, tableEndY + 12);
        doc.text(`Total con IVA: $${sale.total_con_iva.toLocaleString('es-CO')}`, 14, tableEndY + 18);
        doc.text(`Método de Pago: ${sale.metodo_pago}`, 14, tableEndY + 24);

        y = tableEndY + 40;
      });

      doc.save(`reporte-detallado-ventas-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {
      alert('Error al exportar PDF');
    }
  };

  const exportDailyReport = async (type = 'json') => {
    try {
      const sales = await salesAPI.getSales();
      const today = new Date().toISOString().split('T')[0];
      // Filtrar ventas del día actual
      const dailySales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
        return saleDate === today;
      });
      const detailedSales = buildDetailedSales(dailySales);

      if (type === 'json') {
        const reportContent = {
          fecha_exportacion: new Date().toLocaleString('es-CO'),
          ventas: detailedSales
        };
        const dataStr = JSON.stringify(reportContent, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-diario-ventas-${today}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (type === 'csv') {
  let csv = 'Fecha,Cliente,Cédula,Dirección,Correo,Producto,Cantidad,Precio Unitario,Subtotal sin IVA,IVA (19%),Subtotal con IVA,Método de Pago,Subtotal Venta sin IVA,IVA Venta,Total Venta con IVA\n';
        detailedSales.forEach(sale => {
          sale.detalles.forEach(item => {
            csv += `"${sale.fecha}","${sale.cliente}","${sale.cedula}","${sale.direccion}","${sale.correo}","${item.producto}",${item.cantidad},${item.precio_unitario},${item.subtotal_sin_iva},${item.iva},${item.subtotal_con_iva},"${sale.metodo_pago}",${sale.subtotal_sin_iva},${sale.iva},${sale.total_con_iva}\n`;
          });
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-diario-ventas-${today}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (type === 'pdf') {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const title = 'REPORTE DIARIO DE VENTAS';
        let y = 35;
        try {
          const imgInfo = await loadImageDataUrl(logoCompleto);
          const maxImgWidth = Math.min(pageWidth * 0.4, 140);
          const scale = Math.min(1, maxImgWidth / imgInfo.width);
          // reducir tamaño adicionalmente un 30%
          const reductionFactor = 0.7;
          const imgW = imgInfo.width * scale * reductionFactor;
          const imgH = imgInfo.height * scale * reductionFactor;
          const imgX = (pageWidth - imgW) / 2;
          doc.addImage(imgInfo.dataUrl, 'PNG', imgX, 8, imgW, imgH);
          const titleY = 8 + imgH + 6;
          doc.setFontSize(16);
          const textWidth = doc.getTextWidth(title);
          const x = (pageWidth - textWidth) / 2;
          doc.text(title, x, titleY);
          const fechaHora = new Date().toLocaleString('es-CO');
          doc.setFontSize(10);
          doc.text(`Generado el: ${fechaHora}`, 14, titleY + 7);
          y = titleY + 14;
        } catch {
          doc.setFontSize(16);
          doc.text('Reporte Diario de Ventas', 14, 18);
          const fechaHora = new Date().toLocaleString('es-CO');
          doc.setFontSize(10);
          doc.text(`Generado el: ${fechaHora}`, 14, 25);
          y = 35;
        }

        detailedSales.forEach((sale) => {
            // Calcular altura estimada del bloque (ajustado por más líneas de cliente)
            let blockHeight = 90 + (sale.detalles.length * 12);
            if (y + blockHeight > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            y = 18;
          }
          doc.setFillColor(255, 243, 230); 
          doc.setDrawColor(255, 115, 0);   
          doc.roundedRect(10, y - 4, doc.internal.pageSize.getWidth() - 20, blockHeight, 4, 4, 'FD');

          let innerY = y + 4;
          doc.setFontSize(12);
          doc.text(`Fecha: ${sale.fecha}`, 14, innerY);
          doc.text(`Cliente: ${sale.cliente}`, 14, innerY + 6);
          doc.text(`Cédula: ${sale.cedula}`, 14, innerY + 12);
          doc.text(`Dirección: ${sale.direccion}`, 14, innerY + 18);
          doc.text(`Correo: ${sale.correo}`, 14, innerY + 24);
          

          autoTable(doc, {
            startY: innerY + 36,
            margin: { left: 14, right: 14 },
            head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal sin IVA', 'IVA (19%)', 'Subtotal con IVA']],
            body: sale.detalles.map(item => [
              item.producto,
              item.cantidad,
              `$${item.precio_unitario.toLocaleString('es-CO')}`,
              `$${item.subtotal_sin_iva.toLocaleString('es-CO')}`,
              `$${item.iva.toLocaleString('es-CO')}`,
              `$${item.subtotal_con_iva.toLocaleString('es-CO')}`
            ]),
            theme: 'grid',
            headStyles: {
              fillColor: [255, 115, 0],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 11,
              halign: 'center',
              valign: 'middle',
              lineWidth: 0.5,
              lineColor: [255, 115, 0]
            },
            bodyStyles: {
              fontSize: 10,
              textColor: [60, 60, 60],
              lineWidth: 0.2,
              lineColor: [220, 220, 220]
            },
            alternateRowStyles: {
              fillColor: [255, 243, 230]
            },
            styles: {
              cellPadding: 2,
              halign: 'center',
              valign: 'middle',
              minCellHeight: 8,
              font: 'helvetica'
            }
          });

          let tableEndY = doc.lastAutoTable.finalY;
          doc.setFontSize(11);
          doc.text(`Subtotal sin IVA: $${sale.subtotal_sin_iva.toLocaleString('es-CO')}`, 14, tableEndY + 6);
          doc.text(`IVA (19%): $${sale.iva.toLocaleString('es-CO')}`, 14, tableEndY + 12);
          doc.text(`Total con IVA: $${sale.total_con_iva.toLocaleString('es-CO')}`, 14, tableEndY + 18);
          doc.text(`Método de Pago: ${sale.metodo_pago}`, 14, tableEndY + 24);

          y = tableEndY + 40;
        });

        doc.save(`reporte-diario-ventas-${today}.pdf`);
      }
    } catch {
      alert('Error al exportar el reporte diario');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
                  ? 'bg-blue-500 text-white'
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
                  ? 'bg-blue-500 text-white'
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
              onClick={() => reportPeriod === 'daily' ? exportDailyReport('csv') : exportCSV()}
              className="flex items-center px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FaFileCsv className="mr-2" />
              Exportar CSV
            </button>
            <button
              onClick={() => reportPeriod === 'daily' ? exportDailyReport('pdf') : exportPDF()}
              className="flex items-center px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FaFilePdf className="mr-2" />
              Exportar PDF
            </button>
            <button
              onClick={() => reportPeriod === 'daily' ? exportDailyReport('json') : exportReport()}
              className="flex items-center px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
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
            gradient="from-blue-500 to-blue-600"
            colorText="text-blue-100"
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
            gradient="from-blue-500 to-blue-600"
            colorText="text-blue-100"
          />
          
          <MetricCard
            title={reportPeriod === 'daily' ? 'Hora Pico' : 'Mejor Día'}
            value={reportPeriod === 'daily' 
              ? reportData.trends.sort((a, b) => b.sales - a.sales)[0]?.hour || 'N/A'
              : `Día ${reportData.trends.sort((a, b) => b.sales - a.sales)[0]?.day || 'N/A'}`
            }
            detail="Mayor actividad"
            icon={<Calendar className="w-8 h-8" />}
            gradient="from-blue-500 to-blue-600"
            colorText="text-blue-100"
          />
        </div>
      )}

      {/* Reporte detallado por tiempo */}
      {/* 
      {reportData.trends && reportData.trends.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FaChartLine className="text-blue-500 mr-3" />
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
                            className="bg-blue-500 h-2 rounded-full" 
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
      )} */}

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

      {/* Tabla de máximo de ventas por mes (solo en mensual) */}
      {reportPeriod === 'monthly' && reportData.maxSalesByMonth && reportData.maxSalesByMonth.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <div className="px-4 py-2 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-800">
              Ventas Totales por Mes (Año Actual)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Ventas Totales</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Transacciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.maxSalesByMonth.map((month, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900 capitalize">{month.name}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-green-600">{formatCurrency(month.totalSales)}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-gray-500">{month.transactions}</td>
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