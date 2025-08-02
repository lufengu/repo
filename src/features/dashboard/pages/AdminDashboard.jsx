import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { CardEstadisticasAdmin } from "../components";
import { getUsers, toggleUserStatus, deleteUser, updateUser } from "../../../services/userService";

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Estados para edición
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };
  

  const crearUsuario = () => navigate('/admin/create-user');
  
  // Iniciar edición de usuario
  const iniciarEdicion = usuario => {
    setEditingUser(usuario);
    setFormData({ name: usuario.name, email: usuario.email, password: '', role: usuario.rol });
  };
  
  // Cancelar edición
  const cancelarEdicion = () => setEditingUser(null);
  
  // Guardar cambios de edición
  const guardarEdicion = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { name: formData.name, email: formData.email };
      if (formData.password) payload.password = formData.password;
      if (formData.role) payload.role = formData.role;
      const response = await updateUser(editingUser.id, payload);
      if (response.success) {
        await fetchUsuarios();
        setEditingUser(null);
        alert('Usuario actualizado exitosamente');
      } else {
        setError(response.message || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setError(error.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0, limit: 10 });
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce para búsqueda
  const debounceSearch = useCallback((searchValue) => {
    const timer = setTimeout(() => {
      setSearchTerm(searchValue);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Carga usuarios desde API/BD
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsuarios(); }, [pagination.currentPage, searchTerm]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers(pagination.currentPage, pagination.limit, searchTerm);
      if (response.success) {
        setUsuarios(response.data.users || []);
        setPagination(prev => ({ ...prev, totalPages: response.data.pagination.totalPages || 1, totalUsers: response.data.pagination.totalUsers || 0 }));
      } else {
        setError(response.message || 'Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError(error.message || 'Error al cargar usuarios');
    } finally { setLoading(false); }
  };

  const toggleUsuarioStatus = async usuario => {
    const action = usuario.isActive ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de que quieres ${action} este usuario?`)) return;
    try {
      setLoading(true);
      const response = await toggleUserStatus(usuario.id, !usuario.isActive);
      if (response.success) { await fetchUsuarios(); alert(`Usuario ${action}do exitosamente`); }
      else { setError(response.message || `Error al ${action} usuario`); }
    } catch (error) {
      console.error(`Error al ${action} usuario:`, error);
      setError(error.message || `Error al ${action} usuario`);
    } finally { setLoading(false); }
  };

  // Elimina un usuario
  const eliminarUsuario = async usuario => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${usuario.name}?`)) return;
    try {
      setLoading(true);
      const response = await deleteUser(usuario.id);
      if (response.success) {
        await fetchUsuarios();
        alert('Usuario eliminado exitosamente');
      } else {
        setError(response.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError(error.message || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
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
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-gray-600 text-sm">Panel de Administrador</p>
              <h1 className="text-lg font-semibold text-gray-800">Gestión de Usuarios</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Cerrar Sesión
          </button>
        </header>
        {/* Contenido del dashboard */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Panel de Administrador</h1>
            <p className="text-gray-600">Gestión completa del sistema y usuarios registrados en la plataforma.</p>
          </div>
          <div className="mb-6"><CardEstadisticasAdmin usuarios={usuarios} /></div>
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-700">Usuarios Registrados ({pagination.totalUsers})</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <input type="text" placeholder="Buscar usuario..." onChange={e => debounceSearch(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto" />
                <button onClick={crearUsuario} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap">Crear Usuario</button>
              </div>
            </div>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Usuario</th><th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Rol</th><th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th><th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Fecha Registro</th><th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map(usuario => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-white">{usuario.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{usuario.name}</div>
                            <div className="text-sm text-gray-500 truncate">{usuario.email}</div>
                            <div className="sm:hidden">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${usuario.rol==='administrador'?'bg-orange-100 text-orange-800':'bg-green-100 text-green-800'}`}>{usuario.rol}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${usuario.rol==='administrador'?'bg-orange-100 text-orange-800':'bg-green-100 text-green-800'}`}>{usuario.rol}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${usuario.isActive?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{usuario.isActive?'Activo':'Inactivo'}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {new Date(usuario.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                        {/* Botón para activar/desactivar usuario */}
                        <button
                          onClick={() => toggleUsuarioStatus(usuario)}
                          className="px-2 sm:px-3 py-1 rounded text-xs bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          {usuario.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        {/* Botón para eliminar usuario */}
                        <button
                          onClick={() => eliminarUsuario(usuario)}
                          className="px-2 sm:px-3 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                        {/* Botón para editar usuario */}
                        <button
                          onClick={() => iniciarEdicion(usuario)}
                          className="px-2 sm:px-3 py-1 rounded text-xs bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-6 px-4">
              <div className="text-sm text-gray-700">
                Mostrando {((pagination.currentPage-1)*pagination.limit)+1} a {Math.min(pagination.currentPage*pagination.limit,pagination.totalUsers)} de {pagination.totalUsers} usuarios
              </div>
              <div className="flex space-x-2">
                <button onClick={()=>setPagination(prev=>({...prev,currentPage:prev.currentPage-1}))} disabled={pagination.currentPage<=1} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Anterior</button>
                <span className="px-3 py-1 text-sm">Página {pagination.currentPage} de {pagination.totalPages}</span>
                <button onClick={()=>setPagination(prev=>({...prev,currentPage:prev.currentPage+1}))} disabled={pagination.currentPage>=pagination.totalPages} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Siguiente</button>
              </div>
            </div>
            {usuarios.length===0 && !loading && <div className="text-center py-8"><p className="text-gray-500">No se encontraron usuarios</p></div>}
          </div>
        </main>
      </div>
      {/* Formulario de edición de usuario */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Editar Usuario</h2>
            <form onSubmit={guardarEdicion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña (dejar en blanco para no cambiar)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                  required
                >
                  <option value="">Seleccionar rol</option>
                  <option value="administrador">Administrador</option>
                  <option value="usuario">Usuario</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="px-4 py-2 text-sm bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;