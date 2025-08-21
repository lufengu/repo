import { useState, useEffect } from 'react';
import { FaBars } from "react-icons/fa";
import Menu from "../../dashboard/components/Menu";
import SalesRegisterForm from '../components/SalesRegisterForm';
import SalesHistory from '../components/SalesHistory';
import SalesReports from '../components/SalesReports';

import QrPaymentForm from '../components/QrPaymentForm';

const AccessibilityPanel = ({ open, onClose, daltonismMode, setDaltonismMode }) => (
  open ? (
    <div className="fixed top-20 right-8 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-5 w-80 animate-fade-in">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Accesibilidad</h3>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="daltonism"
          checked={daltonismMode}
          onChange={e => setDaltonismMode(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="daltonism" className="text-gray-700">Modo Daltonismo</label>
      </div>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-normal"
        aria-label="Cerrar"
      >×</button>
      <p className="text-xs text-gray-500 mt-2">
        El modo daltonismo ajusta los colores para mejorar la visibilidad de personas con esta condición.
      </p>
    </div>
  ) : null
);

const Ventas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('ventas');
  const [view, setView] = useState('register');
  const [userName, setUserName] = useState('Usuario');
  const [refreshHistory, setRefreshHistory] = useState(0);

  // Estado para mostrar el formulario QR
  const [showQrForm, setShowQrForm] = useState(false);

  // Estado para el panel de accesibilidad
  const [accessOpen, setAccessOpen] = useState(false);
  const [daltonismMode, setDaltonismMode] = useState(false);

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

  // Efecto para aplicar clase global de modo daltonismo
  useEffect(() => {
    if (daltonismMode) {
      document.body.classList.add('daltonism-mode');
    } else {
      document.body.classList.remove('daltonism-mode');
    }
  }, [daltonismMode]);

  // Función para refrescar el historial después de crear una venta
  const handleSaleCreated = () => {
    setRefreshHistory(prev => prev + 1);
    // Cambiar automáticamente a la vista del historial para mostrar la nueva venta
    setView('history');
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
            {/* El botón de menú solo se muestra en móviles, ya está arriba */}
            <div>
              <p className="text-gray-600 text-sm">¡Hola, {userName}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              title="Cargar QR de pago"
              onClick={() => setShowQrForm(true)}
              aria-label="Cargar QR de pago"
            >
              <span className="font-bold text-lg">QR</span>
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
          {/* Formulario QR desplegable */}
          {showQrForm && (
            <QrPaymentForm userName={userName} onClose={() => setShowQrForm(false)} />
          )}
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
          {/* Contenido según la vista seleccionada */}
          <div>
            {view === 'register' && <SalesRegisterForm onSuccess={handleSaleCreated} />}
            {view === 'history' && <SalesHistory refreshTrigger={refreshHistory} />}
            {view === 'report' && <SalesReports />}
          </div>
        </main>
      </div>
      {/* Botón de accesibilidad */}
      <button
        className="fixed top-5 right-10 z-50 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold px-2.5 py-1.5 rounded-full shadow transition-all flex items-center justify-center"
        style={{ transform: 'translateY(-3px) translateX(33px)', fontSize: '0.8rem' }}
        onClick={() => setAccessOpen(true)}
        aria-label="Accesibilidad"
      >
        <span role="img" aria-label="Accesibilidad" style={{ fontSize: '1rem' }}>🦉</span>
      </button>
      <AccessibilityPanel
        open={accessOpen}
        onClose={() => setAccessOpen(false)}
        daltonismMode={daltonismMode}
        setDaltonismMode={setDaltonismMode}
      />
    </div>
  );
};

export default Ventas;