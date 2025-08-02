import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
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
    remember: false,
  });

  // Función que se ejecuta cuando escribes en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError(''); // Limpiar errores al escribir
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    <div className="space-y-6">
      {/* Mostrar errores si los hay */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg mx-auto">
          {error}
        </div>
      )}

      {/* Formulario de Login */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white rounded-lg p-10 shadow-custom max-w-lg mx-auto"
      >
        <h1 className="text-2xl font-bold text-center text-gray-700">Iniciar Sesión</h1>

        {/* Campo de email con icono bonito */}
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-600" />
          <input
            type="email"
            name="email"
            required
            disabled={isLoading}
            value={formData.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-red "
          />
        </div>

        {/* Campo de contraseña con botón para mostrar/ocultar */}
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-600" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            disabled={isLoading}
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-blue-50 disabled:opacity-50"
          />
          {/* Botón del ojito para mostrar/ocultar password */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 disabled:opacity-50"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {/* Checkbox de recordarme y link de forgot password */}
        <div className="flex items-center justify-between text-sm pt-2 w-full" style={{width: '100%', padding: '0 16px'}}>
          <label className="flex items-center space-x-4" style={{minWidth: '140px'}}>
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              disabled={isLoading}
              className="w-4 h-4 text-[#007AFF] border-2 border-gray-300 rounded focus:ring-[#007AFF] focus:ring-2 disabled:opacity-50"
              style={{marginRight: '12px'}}
            />
            <span className="text-gray-700 select-none">Recuérdame</span>
          </label>
          <a href="#" className="text-[#007AFF] hover:underline" style={{marginLeft: 'auto'}}>¿Olvidaste tu contraseña?</a>
        </div>

        {/* Botón de enviar con indicador de carga */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Iniciando...
            </>
          ) : (
            'Iniciar →'
          )}
        </button>
      </form>
    </div>
  );
};
