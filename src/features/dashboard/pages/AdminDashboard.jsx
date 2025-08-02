import { useState, useEffect, useCallback } from "react";
import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import { CardEstadisticasAdmin } from "../components";
import { getUsers, toggleUserStatus, getUserStats } from "../../../services/userService";

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

  // Debounce para búsqueda
  const debounceSearch = useCallback((searchValue) => {
    const timer = setTimeout(() => {
      setSearchTerm(searchValue);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // TODO: Conectar con API/Base de datos
  useEffect(() => {
    fetchUsuarios();
  }, [pagination.currentPage, searchTerm]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getUsers(pagination.currentPage, pagination.limit, searchTerm);
      
      if (response.success) {
        setUsuarios(response.data.users || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pagination.totalPages || 1,
          totalUsers: response.data.pagination.totalUsers || 0
        }));
      } else {
        setError(response.message || 'Error al cargar usuarios');
      }
      
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError(error.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const crearUsuario = async () => {
    // Navegar a la página de crear usuario
    navigate('/admin/create-user');
  };

  const actualizarUsuario = async (id) => {
    // TODO: Implementar en features/admin/services/adminService.js
    alert(`Actualizar usuario ID: ${id} - Pendiente implementar`);
  };

  const toggleUsuarioStatus = async (usuario) => {
    const action = usuario.isActive ? 'desactivar' : 'activar';
    const confirmMessage = `¿Estás seguro de que quieres ${action} este usuario?`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      setLoading(true);
      const response = await toggleUserStatus(usuario.id, !usuario.isActive);
      
      if (response.success) {
        // Recargar la lista de usuarios después de cambiar el estado
        await fetchUsuarios();
        alert(`Usuario ${action}do exitosamente`);
      } else {
        setError(response.message || `Error al ${action} usuario`);
      }
    } catch (error) {
      console.error(`Error al ${action} usuario:`, error);
      setError(error.message || `Error al ${action} usuario`);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header con botón móvil */}
        <header className="bg-white shadow-sm p-3 md:p-4 flex justify-between items-center border-b lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaBars size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
        </header>

        {/* Header con fondo - Responsivo */}
        <div 
          className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 text-white p-4 md:p-6 lg:p-8"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:%23667eea;stop-opacity:1" /><stop offset="100%" style="stop-color:%23764ba2;stop-opacity:1" /></linearGradient></defs><rect width="1000" height="300" fill="url(%23grad)"/></svg>')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">
              Panel de administración
            </h1>
            
            {/* Componente de Cards de estadísticas */}
            <CardEstadisticasAdmin usuarios={usuarios} />
          </div>
        </div>

        {/* Sección de gestión de usuarios - Responsiva */}
        <div className="flex-1 p-3 md:p-4 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header de la tabla - Responsivo */}
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <button 
                    onClick={crearUsuario}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                  >
                    Crear usuario
                  </button>
                  <button 
                    onClick={() => fetchUsuarios()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                  >
                    Actualizar
                  </button>
                </div>
              </div>

              {/* Campo de búsqueda */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  onChange={(e) => debounceSearch(e.target.value)}
                  className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Contenido de la tabla */}
            <div className="p-4 md:p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="text-gray-500 mt-2">Cargando usuarios...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <>
                  {/* Vista de tabla para pantallas medianas y grandes */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usuarios.map((usuario) => (
                          <tr key={usuario.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.name}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.email}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="capitalize">{usuario.rol}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                usuario.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {usuario.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(usuario.createdAt).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => actualizarUsuario(usuario.id)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => toggleUsuarioStatus(usuario)}
                                  className={`${
                                    usuario.isActive 
                                      ? 'bg-red-500 hover:bg-red-600' 
                                      : 'bg-green-500 hover:bg-green-600'
                                  } text-white px-3 py-1 rounded text-xs transition-colors`}
                                >
                                  {usuario.isActive ? 'Desactivar' : 'Activar'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Controles de paginación para vista de tabla */}
                  <div className="hidden md:flex justify-between items-center mt-6 px-4">
                    <div className="text-sm text-gray-700">
                      Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} a {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} de {pagination.totalUsers} usuarios
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={pagination.currentPage <= 1}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Anterior
                      </button>
                      <span className="px-3 py-1 text-sm">
                        Página {pagination.currentPage} de {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={pagination.currentPage >= pagination.totalPages}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>

                  {/* Vista de cards para pantallas pequeñas */}
                  <div className="md:hidden space-y-4">
                    {usuarios.map((usuario) => (
                      <div key={usuario.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{usuario.name}</h3>
                            <p className="text-sm text-gray-600">{usuario.email}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            usuario.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {usuario.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Rol:</span>
                            <span className="ml-1 font-medium capitalize">{usuario.rol}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Fecha:</span>
                            <span className="ml-1 font-medium">{new Date(usuario.createdAt).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <button 
                            onClick={() => actualizarUsuario(usuario.id)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm transition-colors"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => toggleUsuarioStatus(usuario)}
                            className={`flex-1 ${
                              usuario.isActive 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white px-3 py-2 rounded text-sm transition-colors`}
                          >
                            {usuario.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Controles de paginación para vista de cards móvil */}
                  <div className="md:hidden flex flex-col space-y-4 mt-6">
                    <div className="text-sm text-gray-700 text-center">
                      Página {pagination.currentPage} de {pagination.totalPages} ({pagination.totalUsers} usuarios)
                    </div>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={pagination.currentPage <= 1}
                        className="px-4 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={pagination.currentPage >= pagination.totalPages}
                        className="px-4 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;