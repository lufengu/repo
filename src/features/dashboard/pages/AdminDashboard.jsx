import { useState, useEffect, useCallback } from "react";
import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AdminMenu from "../components/AdminMenu";
import { CardEstadisticasAdmin } from "../components";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('admin-dashboard');
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de prueba para desarrollo
  const usuariosPrueba = [
    {
      _id: '1',
      name: 'Juan Pérez',
      email: 'juan@tienda.com',
      rol: 'usuario',
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      _id: '2',
      name: 'María García',
      email: 'maria@tienda.com',
      rol: 'administrador',
      isActive: true,
      createdAt: '2024-01-10'
    },
    {
      _id: '3',
      name: 'Carlos López',
      email: 'carlos@tienda.com',
      rol: 'usuario',
      isActive: false,
      createdAt: '2024-01-20'
    },
    {
      _id: '4',
      name: 'Ana Martínez',
      email: 'ana@tienda.com',
      rol: 'usuario',
      isActive: true,
      createdAt: '2024-01-18'
    },
    {
      _id: '5',
      name: 'Luis Rodríguez',
      email: 'luis@tienda.com',
      rol: 'administrador',
      isActive: true,
      createdAt: '2024-01-12'
    }
  ];

  // Debounce para búsqueda
  const debounceSearch = useCallback((searchValue) => {
    const timer = setTimeout(() => {
      setSearchTerm(searchValue);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Simular carga de usuarios con datos de prueba
  useEffect(() => {
    fetchUsuarios();
  }, [pagination.currentPage, searchTerm]);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filtrar por búsqueda si existe
      let usuariosFiltrados = usuariosPrueba;
      if (searchTerm) {
        usuariosFiltrados = usuariosPrueba.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setUsuarios(usuariosFiltrados);
      setPagination(prev => ({
        ...prev,
        totalUsers: usuariosFiltrados.length,
        totalPages: Math.ceil(usuariosFiltrados.length / prev.limit)
      }));
      
    } catch (err) {
      setError('Error al cargar usuarios. Inténtalo de nuevo más tarde.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUsuarioStatus = async (usuario) => {
    const confirmationText = `¿Estás seguro de que quieres ${usuario.isActive ? 'desactivar' : 'activar'} a ${usuario.name}?`;
    
    if (window.confirm(confirmationText)) {
      try {
        // Simular cambio de estado
        setUsuarios(prev => 
          prev.map(u => 
            u._id === usuario._id 
              ? { ...u, isActive: !u.isActive }
              : u
          )
        );
        alert(`Usuario ${usuario.isActive ? 'desactivado' : 'activado'} exitosamente`);
      } catch (err) {
        alert(`Error al cambiar el estado del usuario: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu lateral */}
      <AdminMenu 
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
              <p className="text-gray-600 text-sm">Panel de Administrador</p>
              <h1 className="text-lg font-semibold text-gray-800">Gestión de Usuarios</h1>
            </div>
          </div>
        </header>

        {/* Contenido del dashboard */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Título principal */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Panel de Administrador</h1>
            <p className="text-gray-600">
              Gestión completa del sistema y usuarios registrados en la plataforma.
            </p>
          </div>

          {/* Cards de estadísticas */}
          <div className="mb-6">
            <CardEstadisticasAdmin usuarios={usuarios} />
          </div>

          {/* Sección de la tabla de usuarios */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-700">
                Usuarios Registrados ({usuarios.length})
              </h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  onChange={(e) => debounceSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
                />
                <button
                  onClick={() => navigate('/admin/create-user')}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                >
                  Crear Usuario
                </button>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {/* Tabla de usuarios - Responsiva */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Rol
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Fecha Registro
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-white">
                              {usuario.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{usuario.name}</div>
                            <div className="text-sm text-gray-500 truncate">{usuario.email}</div>
                            {/* Mostrar rol en móvil */}
                            <div className="sm:hidden">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                usuario.rol === 'administrador' 
                                  ? 'bg-orange-100 text-orange-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {usuario.rol}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          usuario.rol === 'administrador' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          usuario.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {new Date(usuario.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleUsuarioStatus(usuario)}
                          className={`px-2 sm:px-3 py-1 rounded text-xs transition-colors ${
                            usuario.isActive
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {usuario.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mensaje si no hay usuarios */}
            {usuarios.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;