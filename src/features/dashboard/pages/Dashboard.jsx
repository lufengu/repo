// Dashboard.jsx
import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import Menu from "../components/Menu";
import {
  CardVentasDia,
  CardProductosBajos,
  CardUltimosPedidos,
  CardAlertas,
  CardVentasProducto,
  CardVentasMensuales,
} from "../components";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Intentar obtener el nombre de diferentes posibles campos
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
        </header>

        {/* Contenido del dashboard */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Título principal */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Inicio del Dashboard</h1>
            <p className="text-gray-600">
              Bienvenido a la página principal de tu tienda digital. Aquí encontrarás un resumen de tus métricas clave.
            </p>
          </div>

          {/* Primera fila - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <CardVentasDia />
            <CardProductosBajos />
            <CardUltimosPedidos />
          </div>

          {/* Segunda fila - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardAlertas />
            <CardVentasProducto />
            <CardVentasMensuales />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;