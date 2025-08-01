import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import Menu from "../components/Menu";
import { CardEstadisticasAdmin } from "../components";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('admin-dashboard');
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos de ejemplo
  const usuariosEjemplo = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'Admin', estado: 'Activo', fechaRegistro: '2024-01-15' },
    { id: 2, nombre: 'María García', email: 'maria@example.com', rol: 'Tendero', estado: 'Activo', fechaRegistro: '2024-01-20' },
    { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', rol: 'Tendero', estado: 'Inactivo', fechaRegistro: '2024-02-01' },
    { id: 4, nombre: 'Ana Martínez', email: 'ana@example.com', rol: 'Tendero', estado: 'Activo', fechaRegistro: '2024-02-10' },
    { id: 5, nombre: 'Pedro Ruiz', email: 'pedro@example.com', rol: 'Tendero', estado: 'Activo', fechaRegistro: '2024-02-15' }
  ];

  // TODO: Conectar con API/Base de datos
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con API real
      // const response = await fetch('/api/admin/usuarios', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();
      // setUsuarios(data);
      
      setTimeout(() => {
        setUsuarios(usuariosEjemplo);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError('Error al cargar usuarios');
      setLoading(false);
    }
  };

  const crearUsuario = async () => {
    // TODO: Implementar en features/admin/services/adminService.js
    alert('Función crear usuario - Pendiente implementar');
  };

  const actualizarUsuario = async (id) => {
    // TODO: Implementar en features/admin/services/adminService.js
    alert(`Actualizar usuario ID: ${id} - Pendiente implementar`);
  };

  const eliminarUsuario = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
    
    // TODO: Conectar con API
    // try {
    //   await fetch(`/api/admin/usuarios/${id}`, {
    //     method: 'DELETE',
    //     headers: {
    //       'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    //       'Content-Type': 'application/json'
    //     }
    //   });
    //   setUsuarios(usuarios.filter(u => u.id !== id));
    // } catch (error) {
    //   console.error('Error al eliminar usuario:', error);
    // }
    
    setUsuarios(usuarios.filter(u => u.id !== id));
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
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.nombre}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.email}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.rol}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                usuario.estado === 'Activo' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {usuario.estado}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.fechaRegistro}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => actualizarUsuario(usuario.id)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => eliminarUsuario(usuario.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista de cards para pantallas pequeñas */}
                  <div className="md:hidden space-y-4">
                    {usuarios.map((usuario) => (
                      <div key={usuario.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{usuario.nombre}</h3>
                            <p className="text-sm text-gray-600">{usuario.email}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            usuario.estado === 'Activo' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {usuario.estado}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Rol:</span>
                            <span className="ml-1 font-medium">{usuario.rol}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Fecha:</span>
                            <span className="ml-1 font-medium">{usuario.fechaRegistro}</span>
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
                            onClick={() => eliminarUsuario(usuario.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
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