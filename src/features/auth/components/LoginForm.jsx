import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para acceso directo con usuarios de prueba
  const handleTestUserLogin = (userType) => {
    setIsLoading(true);
    setError('');
    
    try {
      const testUsers = {
        admin: {
          id: 1,
          nombre: 'Administrador de Prueba',
          email: 'admin@techderos.com',
          rol: 'administrador'
        },
        user: {
          id: 2,
          nombre: 'Usuario de Prueba',
          email: 'usuario@techderos.com',
          rol: 'usuario'
        }
      };

      const userData = testUsers[userType];
      const mockToken = `test-token-${userType}-${Date.now()}`;
      
      // Simular delay de login
      setTimeout(() => {
        login(userData, mockToken);
        
        const redirectPath = userType === 'admin' ? '/admin' : '/dashboard';
        navigate(redirectPath);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Error al acceder con usuario de prueba');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (!formData.email || !formData.password) {
        throw new Error('Por favor completa todos los campos');
      }

      const response = await loginUser(formData.email, formData.password);
      const userData = response.user;
      const accessToken = response.tokens.accessToken;
      
      login(userData, accessToken);
      
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
      {/* Sección de Usuarios de Prueba - REMOVER EN PRODUCCIÓN */}
      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg">
        <div className="flex items-center mb-3">
          <span className="text-lg">🧪</span>
          <h3 className="ml-2 text-sm font-semibold text-yellow-800">
            Usuarios de Prueba - Solo Desarrollo
          </h3>
        </div>
        <p className="text-xs text-yellow-700 mb-4">
          Usa estos botones para acceder directamente sin credenciales del backend
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTestUserLogin('admin')}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-2">👑</span>
            Acceso Admin
          </button>
          <button
            type="button"
            onClick={() => handleTestUserLogin('user')}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-2">👤</span>
            Acceso Usuario
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <p className="text-xs text-yellow-600">
            <strong>Admin:</strong> Acceso completo al panel administrativo <br/>
            <strong>Usuario:</strong> Acceso al dashboard normal
          </p>
        </div>
      </div>

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