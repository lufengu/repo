import { useState, useEffect } from 'react';
import { FaBars, FaHistory, FaPlus } from "react-icons/fa";
import Menu from "../../dashboard/components/Menu";
import SalesRegisterForm from '../components/SalesRegisterForm';
import SalesHistory from '../components/SalesHistory';
import SalesReports from '../components/SalesReports';

import QrPaymentForm from '../components/QrPaymentForm';

// Accessibility panel removed

const Ventas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('ventas');
  const [view, setView] = useState('register');
  const [userName, setUserName] = useState('Usuario');
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [lastSale, setLastSale] = useState(null);

  // Estado para mostrar el formulario QR
  const [showQrForm, setShowQrForm] = useState(false);

  // Modal de éxito y reinicio del formulario
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // Accesibilidad eliminada: no hay estado ni panel

  useEffect(() => {
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
  }, []);

  // Función para refrescar el historial después de crear una venta
  const handleSaleCreated = (saleData) => {
    setRefreshHistory(prev => prev + 1);
    setLastSale(saleData || null);
    setShowSuccessModal(true);
  };

  const handleNewSale = () => {
    setShowSuccessModal(false);
    setView('register');
    setFormKey(k => k + 1); 
  };

  const handleGoToHistory = () => {
    setShowSuccessModal(false);
    setView('history');
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-row">
      {/* Menú fijo en escritorio */}
      <div className="hidden md:block md:min-w-[220px] lg:min-w-[260px] xl:min-w-[300px] bg-white shadow-lg">
        <Menu
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>
      {/* Botón para abrir menú en móviles */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <FaBars size={22} />
      </button>
      {/* Drawer menú en móviles */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="relative w-64 bg-white shadow-xl h-full">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl z-50"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              ×
            </button>
            <Menu
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
          <div className="flex-1 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}
      <div className="flex-1 flex flex-col">
        {/* Header superior */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <p className="text-gray-600 font-semibold" style={{ fontSize: '1.755rem' }}>¡Hola, {userName}!</p>
              <span className="text-gray-600 font-semibold" style={{ fontSize: '1.755rem' }}>Más ventas, más futuro para tu tienda</span>
            </div>
          </div>
        </header>
        {/* Contenido del dashboard de ventas */}
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Gestión de Ventas</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Registra ventas, consulta el historial y genera reportes detallados.
            </p>
          </div>
          {/* Navegación de pestañas */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">  
            <div className="flex flex-1 flex-col sm:flex-row gap-2 sm:gap-4">
              <button 
                onClick={() => setView('register')} 
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors ${
                  view === 'register' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Registrar Venta
              </button>
              <button 
                onClick={() => setView('history')} 
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors ${
                  view === 'history' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Historial
              </button>
              <button 
                onClick={() => setView('report')} 
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors ${
                  view === 'report' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Reportes
              </button>
            </div>
            <div className="flex items-center justify-end flex-1">
              {view === 'register' && (
                <button
                  className="px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors bg-orange-500 text-white flex items-center gap-2 shadow-lg hover:bg-orange-600"
                  onClick={() => setShowQrForm(true)}
                  aria-label="Cargar QR de pago"
                  title="Código QR de pago"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
                  Código QR de pago
                </button>
              )}
            </div>
            {showQrForm && (
              <QrPaymentForm userName={userName} onClose={() => setShowQrForm(false)} />
            )}
          </div>
          <div>
            {view === 'register' && <SalesRegisterForm key={formKey} onSuccess={handleSaleCreated} />}
            {view === 'history' && <SalesHistory refreshTrigger={refreshHistory} />}
            {view === 'report' && <SalesReports />}
          </div>
        </main>
      </div>

      {/* Modal Venta Registrada*/}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
          <div className="bg-white w-11/12 max-w-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 0 0-1.22-.872l-3.236 4.529-1.565-1.565a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.16-.096l3.731-5.306Z" clipRule="evenodd"/></svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Venta registrada</h2>
            <p className="mt-1 text-gray-600">La venta se guardó correctamente.</p>

            {/* Resumen */}
            <div className="mt-5 text-left bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(lastSale?.total || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Productos:</span>
                <span className="font-medium text-gray-900">{lastSale?.totalItems ?? (lastSale?.items?.reduce((a,b)=>a+(b.quantity||0),0) || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium text-gray-900">{lastSale?.customer || 'Cliente General'}</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleGoToHistory}
                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow inline-flex items-center justify-center gap-2"
              >
                <FaHistory /> Ver historial
              </button>
              <button
                onClick={handleNewSale}
                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow inline-flex items-center justify-center gap-2"
              >
                <FaPlus /> Nueva venta
              </button>
            </div>

            <button
              onClick={handleCloseSuccess}
              className="mt-4 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

export default Ventas;