import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const LoginForm = () => {
  // Hook para navegar entre páginas y contexto de autenticación
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Estados para mostrar/ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Datos del formulario de usuario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Función que se ejecuta cuando escribes en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cuando envías el formulario de usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Validaciones básicas del frontend
      if (!formData.email || !formData.password) {
        throw new Error('Por favor completa todos los campos');
      }

      // Llamamos al servicio para validar el usuario en el servidor
      const response = await loginUser(formData.email, formData.password);
      
      // Ahora la respuesta tiene estructura: {success, message, user, tokens}
      const userData = response.user;
      const accessToken = response.tokens.accessToken;
      
      // Usar el contexto para manejar el login
      login(userData, accessToken);
      
      // Redirigir según el rol
      const userRole = userData.rol || userData.role;
      const redirectPath = (userRole === 'admin' || userRole === 'administrador') ? '/admin' : '/dashboard';
      navigate(redirectPath);
      
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico <span className="text-brand-orange">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            disabled={isLoading}
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingresa tu correo"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña <span className="text-brand-orange">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              disabled={isLoading}
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Iniciando Sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>
    </div>
  );
};
