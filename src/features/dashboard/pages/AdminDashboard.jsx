import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { CardEstadisticasAdmin } from "../components";
import { getUsers, toggleUserStatus, deleteUser, updateUser } from "../../../services/userService";

// =======================
// COMPONENTES AUXILIARES
// =======================

/**
 * Componente de paginación para navegar entre páginas de usuarios.
 * Props:
 * - pagination: objeto con información de la paginación actual.
 * - setPagination: función para actualizar la paginación.
 */
const Paginacion = ({ pagination, setPagination }) => (
  <div className="flex items-center bg-white rounded-xl shadow border divide-x divide-gray-200 overflow-hidden">
    <button
      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
      disabled={pagination.currentPage <= 1}
      className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-l-xl focus:outline-none transition-colors ${
        pagination.currentPage <= 1
          ? "bg-blue-100 text-blue-400 cursor-not-allowed"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      <span className="material-icons text-base"></span>
      <span>Anterior</span>
    </button>
    <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white">
      Página {pagination.currentPage} de {pagination.totalPages}
    </span>
    <button
      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
      disabled={pagination.currentPage >= pagination.totalPages}
      className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-r-xl focus:outline-none transition-colors ${
        pagination.currentPage >= pagination.totalPages
          ? "bg-orange-100 text-orange-400 cursor-not-allowed"
          : "bg-orange-500 text-white hover:bg-orange-600"
      }`}
    >
      <span>Siguiente</span>
      <span className="material-icons text-base"></span>
    </button>
  </div>
);

/**
 * Tabla de usuarios para vista en escritorio.
 * Props:
 * - usuarios: array de usuarios a mostrar.
 * - toggleUsuarioStatus: función para activar/desactivar usuario.
 * - eliminarUsuario: función para eliminar usuario.
 * - iniciarEdicion: función para editar usuario.
 */
const TablaUsuarios = ({ usuarios, eliminarUsuario, iniciarEdicion }) => (
  <div className="overflow-x-auto hidden sm:block">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Usuario</th>
          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Rol</th>
          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Fecha Registro</th>
          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {usuarios.map(usuario => (
          <tr key={usuario.id} className="hover:bg-gray-50">
            {/* ...celdas de usuario... */}
            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-white">{usuario.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{usuario.name}</div>
                  <div className="text-sm text-gray-500 truncate">{usuario.email}</div>
                  <div className="sm:hidden">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${usuario.rol === "administrador" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>{usuario.rol}</span>
                  </div>
                </div>
              </div>
            </td>
            <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${usuario.rol === "administrador" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>{usuario.rol}</span>
            </td>
            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${usuario.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{usuario.isActive ? "Activo" : "Inactivo"}</span>
            </td>
            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
              {new Date(usuario.createdAt).toLocaleDateString("es-ES")}
            </td>
            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
              {/* Botón Desactivar/Activar eliminado */}
              <button
                onClick={() => eliminarUsuario(usuario)}
                className="px-2 sm:px-3 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
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
);

/**
 * Tarjetas de usuario para vista móvil.
 * Props igual que TablaUsuarios.
 */
const CardsUsuarios = ({ usuarios, toggleUsuarioStatus, eliminarUsuario, iniciarEdicion }) => (
  <div className="sm:hidden space-y-4">
    {usuarios.map(usuario => (
      <div key={usuario.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        {/* ...contenido de la tarjeta... */}
        <div className="flex items-center mb-2">
          <div className="h-8 w-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">{usuario.name.charAt(0)}</span>
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900">{usuario.name}</p>
            <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs mb-2">
          <span className={`px-2 py-1 rounded-full ${usuario.rol === "administrador" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>{usuario.rol}</span>
          <span className={`px-2 py-1 rounded-full ${usuario.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{usuario.isActive ? "Activo" : "Inactivo"}</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">{new Date(usuario.createdAt).toLocaleDateString("es-ES")}</p>
        <div className="flex flex-col space-y-2">
          <button
            className={`px-4 py-2 rounded ${usuario.isActive ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
            onClick={() => toggleUsuarioStatus(usuario.id)}
          >
            {usuario.isActive ? "Desactivar" : "Activar"}
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white"
            onClick={() => iniciarEdicion(usuario)}
          >
            Editar
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700"
            onClick={() => eliminarUsuario(usuario.id)}
          >
            Eliminar
          </button>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Modal para editar usuario.
 * Props:
 * - editingUser: usuario en edición.
 * - formData: datos del formulario.
 * - setFormData: función para actualizar datos.
 * - cancelarEdicion: función para cerrar modal.
 * - guardarEdicion: función para guardar cambios.
 */
const ModalEditarUsuario = ({ formData, setFormData, cancelarEdicion, guardarEdicion }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Editar Usuario</h2>
      <ModalEditarUsuarioForm formData={formData} setFormData={setFormData} cancelarEdicion={cancelarEdicion} guardarEdicion={guardarEdicion} />
    </div>
  </div>

);

// Nuevo componente para el formulario con el ojito
function ModalEditarUsuarioForm({ formData, setFormData, cancelarEdicion, guardarEdicion }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState("");

  // Validaciones individuales
  function getPasswordError(value) {
    if (!value) return "";
    if (value.length < 8) return "Mínimo 8 caracteres";
    if (!/[a-z]/.test(value)) return "Falta una minúscula";
    if (!/[A-Z]/.test(value)) return "Falta una mayúscula";
    if (!/\d/.test(value)) return "Falta un número";
    if (!/[@$!%*?&]/.test(value)) return "Falta un carácter especial";
    return "";
  }

  function handlePasswordChange(e) {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setPasswordError(getPasswordError(value));
  }
  return (
    <form onSubmit={guardarEdicion}>
      {/* ...campos del formulario... */}
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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handlePasswordChange}
            className={`px-3 py-2 border ${passwordError ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full pr-10`}
          />
        {passwordError && (
          <p className="text-xs text-red-500 mt-1">{passwordError}</p>
        )}
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-none"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
        <select
          value={formData.rol}
          onChange={e => setFormData({ ...formData, rol: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
          required
        >
          <option value="">Seleccionar rol</option>
          <option value="tendero">Tendero</option>
          <option value="administrador">Administrador</option>
          <option value="supervisor">Supervisor</option>
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
  );
}

// =======================
// COMPONENTE PRINCIPAL
// =======================

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // -----------------------
  // ESTADOS DEL COMPONENTE
  // -----------------------
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", rol: "" });
  const [usuarios, setUsuarios] = useState([]);
  const [allUsuarios, setAllUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0, limit: 8 });
  const [searchInput, setSearchInput] = useState(""); // Input visible
  const [searchTerm, setSearchTerm] = useState("");  // Término aplicado

  // -----------------------
  // FUNCIONES DE NAVEGACIÓN
  // -----------------------

  /**
   * Cierra la sesión del usuario actual.
   */
  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      logout();
      navigate("/login");
    }
  };

  /**
   * Redirige a la página de creación de usuario.
   */
  const crearUsuario = () => navigate("/admin/create-user");

  // -----------------------
  // FUNCIONES DE EDICIÓN
  // -----------------------

  /**
   * Inicia la edición de un usuario.
   * @param {Object} usuario - Usuario a editar.
   */
  const iniciarEdicion = usuario => {
    setEditingUser(usuario);
    setFormData({
      name: usuario.name,
      email: usuario.email,
      password: "",
      rol: usuario.rol
    });
  };

  /**
   * Cancela la edición de usuario.
   */
  const cancelarEdicion = () => setEditingUser(null);

  /**
   * Guarda los cambios realizados en el usuario editado.
   * @param {Event} e - Evento de formulario.
   */
  const guardarEdicion = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        email: formData.email
      };
      if (formData.password) payload.password = formData.password;
      if (formData.rol) payload.rol = formData.rol;
      await updateUser(editingUser.id, payload);
      await fetchUsuarios();
      setEditingUser(null);
      alert("Usuario actualizado exitosamente");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // MANEJO DE BÚSQUEDA MANUAL
  // -----------------------

  /**
   * Aplica el término de búsqueda solo al hacer clic en el botón de búsqueda.
   * Si el campo está vacío, restablece el listado y la paginación.
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") {
      setSearchTerm("");
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    } else {
      setSearchTerm(searchInput);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };

  // -----------------------
  // EFECTOS
  // -----------------------

  /**
   * Actualiza la lista de usuarios al cambiar la página o el término de búsqueda aplicado.
   */
  useEffect(() => { fetchUsuarios(); }, [pagination.currentPage, searchTerm]);

  // -----------------------
  // FUNCIONES DE USUARIOS
  // -----------------------

  /**
   * Obtiene los usuarios paginados y todos los usuarios para estadísticas.
   */
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers(pagination.currentPage, pagination.limit, searchTerm);
      if (response.success) {
        const pageUsers = response.data.users || [];
        const total = response.data.pagination.totalUsers || 0;
        setUsuarios(pageUsers);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pagination.totalPages || 1,
          totalUsers: total
        }));
        const allResponse = await getUsers(1, total, searchTerm);
        if (allResponse.success) {
          setAllUsuarios(allResponse.data.users || []);
        } else {
          console.warn("Error al cargar todos los usuarios:", allResponse.message);
        }
      } else {
        setError(response.message || "Error al cargar usuarios");
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setError(error.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Activa o desactiva el estado de un usuario.
   * @param {Object} usuario - Usuario a modificar.
   */
  const toggleUsuarioStatus = async usuario => {
    const action = usuario.isActive ? "desactivar" : "activar";
    if (!window.confirm(`¿Estás seguro de que quieres ${action} este usuario?`)) return;
    try {
      setLoading(true);
      const response = await toggleUserStatus(usuario.id, !usuario.isActive);
      if (response.success) {
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

  /**
   * Elimina un usuario del sistema.
   * @param {Object} usuario - Usuario a eliminar.
   */
  const eliminarUsuario = async usuario => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${usuario.name}?`)) return;
    try {
      setLoading(true);
      const response = await deleteUser(usuario.id);
      if (response.success) {
        await fetchUsuarios();
        alert("Usuario eliminado exitosamente");
      } else {
        setError(response.message || "Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setError(error.message || "Error al eliminar usuario");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // RENDER DEL COMPONENTE
  // -----------------------

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
        {/* Header */}
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
        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Panel de Administrador</h1>
            <p className="text-gray-600">Gestión completa del sistema y usuarios registrados en la plataforma.</p>
          </div>
          <div className="mb-6">
            <CardEstadisticasAdmin usuarios={allUsuarios} />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            {/* Filtros y acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-700">
                Usuarios Registrados ({pagination.totalUsers})
              </h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <form
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto"
                  onSubmit={handleSearch}
                >
                  <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={searchInput}
                    autoComplete="off"
                    onKeyDown={e => e.key === "Enter" && e.preventDefault()}
                    onChange={e => {
                      setSearchInput(e.target.value);
                      if (e.target.value.trim() === "") {
                        setSearchTerm("");
                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    title="Buscar"
                  >
                    <span className="material-icons">Buscar</span>
                  </button>
                  <button
                    onClick={crearUsuario}
                    type="button"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                  >
                    Crear Usuario
                  </button>
                </form>
              </div>
            </div>
            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {/* Tabla y tarjetas de usuarios */}
            <TablaUsuarios
              usuarios={usuarios}
              eliminarUsuario={eliminarUsuario}
              iniciarEdicion={iniciarEdicion}
            />
            <CardsUsuarios
              usuarios={usuarios}
              toggleUsuarioStatus={toggleUsuarioStatus}
              eliminarUsuario={eliminarUsuario}
              iniciarEdicion={iniciarEdicion}
            />
            {/* Paginación */}
            <div className="flex justify-between items-center mt-6 px-4">
              <div className="text-sm text-gray-700">
                Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} a {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} de {pagination.totalUsers} usuarios
              </div>
              <Paginacion pagination={pagination} setPagination={setPagination} />
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
      {/* Modal de edición */}
      {editingUser && (
        <ModalEditarUsuario
          formData={formData}
          setFormData={setFormData}
          cancelarEdicion={cancelarEdicion}
          guardarEdicion={guardarEdicion}
        />
      )}
    </div>
  );
}

export default AdminDashboard;