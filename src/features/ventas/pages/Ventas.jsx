import { useState, useEffect } from 'react';
import { FaBars } from "react-icons/fa";
import Menu from "../../dashboard/components/Menu";
import SalesRegisterForm from '../components/SalesRegisterForm';
import SalesHistory from '../components/SalesHistory';
import SalesReports from '../components/SalesReports';

const Ventas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('ventas');
  const [view, setView] = useState('register');
  const [userName, setUserName] = useState('Usuario');

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

  return (
    <div className="flex h-screen bg-gray-100">
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
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              <FaBars size={20} />
            </button>
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
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Contenido del dashboard de ventas */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Ventas</h1>
            <p className="text-gray-600">
              Registra ventas, consulta el historial y genera reportes detallados.
            </p>
          </div>

          {/* Navegación de pestañas */}
          <div className="flex space-x-4 mb-6">  
            <button 
              onClick={() => setView('register')} 
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                view === 'register' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Registrar Venta
            </button>
            <button 
              onClick={() => setView('history')} 
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                view === 'history' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Historial
            </button>
            <button 
              onClick={() => setView('report')} 
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
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
            {view === 'register' && <SalesRegisterForm />}
            {view === 'history' && <SalesHistory />}
            {view === 'report' && <SalesReports />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Ventas;