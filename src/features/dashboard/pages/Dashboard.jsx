// Dashboard.jsx
import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import Menu from "../components/Menu";
import { useProductos } from "../../../hooks/useProductos"; // Importar el hook
import {
  CardVentasDia,
  CardProductosBajos,
  CardUltimosPedidos,
  CardAlertas,
  CardVentasProducto,
  CardVentasMensuales,
} from "../components";
import { salesAPI } from '../../ventas/services/salesService';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userName, setUserName] = useState('Usuario');
  const [refreshTrigger] = useState(false);
  

  // Usar el hook de productos
  const { productos } = useProductos();

  // Estado para ventas mensuales
  const [ventasMensuales, setVentasMensuales] = useState([]);

  useEffect(() => {
    const fetchVentasMensuales = async () => {
      try {
        const sales = await salesAPI.getSales();
        // Agrupar ventas por mes del año actual
        const today = new Date();
        const months = Array.from({ length: 12 }, (_, i) => ({
          mes: new Date(2000, i, 1).toLocaleString('es-CO', { month: 'short' }),
          ventas: 0,
          ventasUnidades: 0
        }));
        sales.forEach(sale => {
          const date = new Date(sale.createdAt);
          if (date.getFullYear() === today.getFullYear()) {
            const m = date.getMonth();
            months[m].ventas += sale.total || (sale.price * sale.quantity) || 0;
            // Unidades: sumar cantidad de items vendidos
            if (sale.items && Array.isArray(sale.items)) {
              months[m].ventasUnidades += sale.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            } else if (sale.quantity) {
              months[m].ventasUnidades += sale.quantity;
            } else {
              months[m].ventasUnidades += 1;
            }
          }
        });
        setVentasMensuales(months);
      } catch {
        setVentasMensuales([]);
      }
    };
    fetchVentasMensuales();
  }, []);

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
            <CardProductosBajos productos={productos} />
            <CardUltimosPedidos />
          </div>

          {/* Segunda fila - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardAlertas />
            <CardVentasProducto refreshTrigger={refreshTrigger} />
            <CardVentasMensuales data={ventasMensuales} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
