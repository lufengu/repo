import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaUserTag, FaEye, FaEyeSlash, FaSave, FaTimes } from 'react-icons/fa';
import { createUser } from '../services/adminService';

// Modal de confirmación local (sin dependencias externas)
function ConfirmDialog({ open, title = 'Confirmar acción', message, confirmText = 'Confirmar', cancelText = 'Cancelar', busy = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={busy ? undefined : onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          <div className="px-5 py-4 text-gray-600">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
          <div className="px-5 py-4 bg-gray-50 flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-60" onClick={onCancel} disabled={busy}>
              {cancelText}
            </button>
            <button type="button" className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60" onClick={onConfirm} disabled={busy}>
              {busy ? 'Procesando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'usuario'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Toasts locales (no bloqueantes)
  const [toasts, setToasts] = useState([]);
  const addToast = (type, message, timeout = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, timeout);
  };
  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  // Confirm dialog local
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', confirmText: 'Confirmar', cancelText: 'Cancelar', onConfirm: null });
  const [confirmBusy, setConfirmBusy] = useState(false);
  const openConfirm = ({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm }) => {
    setConfirmState({ open: true, title: title || 'Confirmar acción', message, confirmText, cancelText, onConfirm });
  };
  const closeConfirm = () => {
    if (confirmBusy) return;
    setConfirmState(prev => ({ ...prev, open: false }));
  };

  const roles = [
    { value: 'usuario', label: 'Usuario' },
    { value: 'administrador', label: 'Administrador' },
    { value: 'moderador', label: 'Moderador' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar rol
    if (!formData.rol) {
      newErrors.rol = 'Selecciona un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Llamar al servicio para crear usuario
      const response = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rol: formData.rol
      });
      
      if (response.success) {
        addToast('success', 'Usuario creado exitosamente');
        
        // Limpiar formulario
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          rol: 'usuario'
        });
        
        // Opcional: redirigir de vuelta a la lista de usuarios
        // window.history.back();
        
      } else {
        addToast('error', `Error: ${response.message || 'No se pudo crear el usuario'}`);
      }
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      addToast('error', 'Error inesperado al crear el usuario. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    openConfirm({
      title: 'Cancelar creación',
      message: '¿Estás seguro de que quieres cancelar? Se perderán los datos ingresados.',
      confirmText: 'Sí, cancelar',
      onConfirm: async () => {
        try {
          setConfirmBusy(true);
          window.history.back();
        } finally {
          setConfirmBusy(false);
          closeConfirm();
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Información del Usuario</h2>
        <p className="text-gray-600">Completa todos los campos para crear un nuevo usuario</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre completo */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingresa el nombre completo"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico *
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ejemplo@correo.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Rol */}
        <div>
          <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-2">
            Rol del Usuario *
          </label>
          <div className="relative">
            <FaUserTag className="absolute left-3 top-3 text-gray-400" />
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                errors.rol ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          {errors.rol && (
            <p className="mt-1 text-sm text-red-600">{errors.rol}</p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña *
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña *
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Repite la contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando Usuario...
              </>
            ) : (
              <>
                <FaSave />
                Crear Usuario
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <FaTimes />
            Cancelar
          </button>
        </div>
      </form>
      {/* Toasts local */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            onClick={() => removeToast(t.id)}
            className={`max-w-sm w-full px-4 py-2 rounded shadow-lg text-sm flex items-start gap-3 cursor-pointer ${
              t.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
              t.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
              'bg-gray-50 border border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex-1">{t.message}</div>
            <button className="text-xs opacity-70">Cerrar</button>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        busy={confirmBusy}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default CreateUserForm;
