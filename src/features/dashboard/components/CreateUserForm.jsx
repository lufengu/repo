import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaUserTag, FaEye, FaEyeSlash, FaSave, FaTimes } from 'react-icons/fa';
import { createUser } from '../services/adminService';

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
    
      // Limpiar error al modificar el campo
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
        alert('Usuario creado exitosamente');
        
        // Limpiar formulario
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          rol: 'usuario'
        });
        
      } else {
        alert(`Error: ${response.message}`);
      }
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert('Error inesperado al crear el usuario. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const handleCancel = () => {
    setConfirmCancelOpen(true);
  };

  const confirmCancel = () => {
    setConfirmCancelOpen(false);
    window.history.back();
  };

  const closeConfirmCancel = () => setConfirmCancelOpen(false);

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
      {/* Modal propio para confirmar cancelación (render dentro del componente) */}
      {confirmCancelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">¿Confirmar cancelación?</h3>
            <p className="mb-4">Se perderán los datos ingresados. ¿Deseas continuar?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeConfirmCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Volver
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateUserForm;
