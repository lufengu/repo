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
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  

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
    <div className="min-h-screen bg-gray-100 flex flex-row">
      {/* Menú fijo en escritorio */}
  <div className="hidden md:block md:min-w-[220px] lg:min-w-[260px] xl:min-w-[300px] bg-white no-shadow-menu">
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
        <FaBars size={24} />
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
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header móvil */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center">
          <p className="ml-2 font-bold text-gray-800" style={{ fontSize: '2.34rem' }}>¡Hola, {userName}!</p>
        </div>
        {/* Header escritorio */}
        <header className="hidden lg:flex bg-white shadow-sm p-4 justify-between items-center border-b">
          <div className="flex items-center space-x-4">
            <p className="text-gray-600 font-semibold" style={{ fontSize: '1.755rem' }}>¡Hola, {userName}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>
        {/* Contenido del dashboard */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Título principal */}
            <div className="mb-2 sm:mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Mi Tienda</h1>
              <p className="text-gray-600 text-[1.05rem] sm:text-[1.2rem]">
                Impulsa tu tienda: gestiona, vende y crece con confianza.
              </p>
            </div>
            {/* Primera fila - 3 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-2 sm:mb-6">
              <CardVentasDia />
              <CardProductosBajos productos={productos} />
              <CardUltimosPedidos />
            </div>
            {/* Segunda fila - 3 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <CardAlertas />
              <CardVentasProducto refreshTrigger={refreshTrigger} onRefreshToggle={() => setRefreshTrigger(t => !t)} />
              <CardVentasMensuales data={ventasMensuales} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
