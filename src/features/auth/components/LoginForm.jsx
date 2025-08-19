
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import logoCompleto from '../../../assets/logoCompleto.png';

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
    <div className="w-full flex flex-col items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-8 space-y-6 border border-gray-100 animate-fade-in"
        style={{ minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
      >
        {/* Logo y subtítulo dentro del formulario */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={logoCompleto}
            alt="Logo Techderos"
            className="w-60 max-w-xs mb-2 object-contain drop-shadow-md"
            style={{ marginTop: '-10px' }}
          />
          <p className="text-brand-blue text-center text-base mb-2">De tendero a tendero, sabemos lo que necesitas.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-base font-medium text-gray-700">
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
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-blue text-base bg-gray-50"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-base font-medium text-gray-700">
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-blue text-base bg-gray-50"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-sky-400 via-blue-600 to-blue-800 text-white py-3 rounded-lg font-semibold shadow-lg hover:scale-105 hover:shadow-xl hover:from-blue-500 hover:to-blue-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg gap-2"
          style={{ boxShadow: '0 4px 16px 0 rgba(56, 189, 248, 0.15)' }}
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
        <style>{`
          .animate-fade-in {
            animation: fade-in 0.8s ease;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Links de ayuda y registro */}
        <div className="flex justify-between items-center text-sm mt-2">
          <a href="#" className="text-brand-blue hover:underline">¿Olvidaste tu contraseña?</a>
          <a href="#" className="text-brand-blue hover:underline">Crear cuenta</a>
        </div>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-2 text-gray-400 text-xs">Iniciar sesión con</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>

        {/* Botones de Google y QR */}
        <div className="flex gap-4">
          <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 bg-white hover:bg-gray-50 transition">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span className="font-medium text-gray-700">Google</span>
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 bg-white hover:bg-gray-50 transition">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></svg>
            <span className="font-medium text-gray-700">Código QR</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Oculta el cursor de texto globalmente excepto en inputs, textareas y contenteditables
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    body, * {
      caret-color: transparent !important;
    }
    input, textarea, [contenteditable="true"] {
      caret-color: auto !important;
    }
  `;
  document.head.appendChild(style);
}
