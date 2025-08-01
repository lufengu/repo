import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

export const LoginForm = () => {
  // Hook para navegar entre páginas - como un GPS para la app
  const navigate = useNavigate();
  
  // Estado para saber si estamos en el form de login normal o admin
  const [isLoginForm, setIsLoginForm] = useState(true);
  
  // Estados para mostrar/ocultar las contraseñas - para que no vean tu password por encima del hombro
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Datos del formulario de usuario normal - email, password y si quiere que lo recuerde
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  // Datos específicos para el admin - separados porque son diferentes
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
  });

  // Función que se ejecuta cuando escribes en los campos del form normal
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Si es un checkbox usa 'checked', si no usa 'value' - porque los checkboxes son especiales
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Lo mismo pero para el formulario de admin - mantenemos separados los datos
  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cuando envías el formulario de usuario normal
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue - no queremos eso
    try {
      // Llamamos al servicio para validar el usuario en el servidor
      const data = await loginUser(formData.email, formData.password);
      
      // Si todo sale bien, guardamos el token y los datos del usuario en localStorage
      // Es como guardar la llave de tu casa en tu bolsillo
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirigimos dependiendo del rol - admin va a su panel, usuario normal a dashboard
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      // Si algo falla, mostramos el error - no muy elegante pero funciona
      alert(err.message);
    }
  };

  // Para el acceso de admin - aquí hacemos una verificación hardcodeada (no muy seguro pero es para demo)
  const handleAdminVerification = async (e) => {
    e.preventDefault();
    
    // Verificamos si las credenciales son exactamente estas - como una contraseña master
    if (
      adminData.email === 'admin@example.com' &&
      adminData.password === 'admin123'
    ) {
      // Si coinciden, creamos un usuario admin falso pero funcional
      const mock = {
        user: {
          id: '1',
          email: adminData.email,
          name: 'Admin Demo',
          role: 'admin',
        },
        token: 'mock_admin_token',
      };
      
      // Guardamos los datos igual que con un usuario normal
      localStorage.setItem('authToken', mock.token);
      localStorage.setItem('user', JSON.stringify(mock.user));
      
      // Y enviamos directo al panel de admin
      navigate('/admin/dashboard');
    } else {
      // Si se equivocan, les recordamos cuáles son las credenciales correctas
      alert('Credenciales incorrectas. Usa: admin@example.com / admin123');
      // Y limpiamos los campos para que vuelvan a intentar
      setAdminData({ email: '', password: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Botones para cambiar entre formularios */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          type="button"
          className={`px-8 py-2 rounded-lg font-medium transition-colors min-w-[160px] ${
            isLoginForm 
              ? 'bg-[#007AFF] text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => {
            setIsLoginForm(true);
            setAdminData({ email: '', password: '' });
          }}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          className={`px-8 py-2 rounded-lg font-medium transition-colors min-w-[160px] ${
            !isLoginForm 
              ? 'bg-[#FF6600] text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => {
            setIsLoginForm(false);
            setAdminData({ email: '', password: '' });
          }}
        >
          Acceso Admin
        </button>
      </div>

      {/* Formulario de Login Normal - USANDO SHADOW CUSTOM */}
      {isLoginForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white rounded-lg p-8 shadow-custom max-w-md mx-auto"
        >
          <h1 className="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h1>

          {/* Campo de email con icono bonito */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-600" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-blue-50"
            />
          </div>

          {/* Campo de contraseña con botón para mostrar/ocultar */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-600" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-blue-50"
            />
            {/* Botón del ojito para mostrar/ocultar password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Checkbox de recordarme y link de forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              Recuérdame
            </label>
            <a href="#" className="text-[#007AFF] hover:underline">¿Olvidaste tu contraseña?</a>
          </div>

          {/* Botón de enviar con gradiente bonito */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-2.5 rounded-lg"
          >
            Iniciar →
          </button>
        </form>
      )}

      {/* Formulario de Admin - USANDO SHADOW CUSTOM */}
      {!isLoginForm && (
        <form
          onSubmit={handleAdminVerification}
          className="space-y-6 bg-white rounded-lg p-8 shadow-custom max-w-md mx-auto"
        >
          <h1 className="text-2xl font-bold text-center text-gray-800">Acceso Administrador</h1>

          {/* Caja amarilla con las credenciales de prueba - para que no tengan que adivinar */}
          <div className="bg-yellow-100 p-4 rounded">
            <p className="text-yellow-700 font-medium">Prueba de usuario:</p>
            <p>Email: admin@example.com</p>
            <p>Contraseña: admin123</p>
          </div>

          {/* Campo de email del admin */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-600" />
            <input
              type="email"
              name="email"
              required
              value={adminData.email}
              onChange={handleAdminChange}
              placeholder="Correo de administrador"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-blue-50"
            />
          </div>

          {/* Campo de contraseña del admin con su propio toggle */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-600" />
            <input
              type={showAdminPassword ? 'text' : 'password'}
              name="password"
              required
              value={adminData.password}
              onChange={handleAdminChange}
              placeholder="Contraseña"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-blue-50"
            />
            <button
              type="button"
              onClick={() => setShowAdminPassword(!showAdminPassword)}
              className="absolute right-3 top-3"
            >
              {showAdminPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Botón de admin con color naranja y icono de escudo */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF6600] to-[#CC5100] text-white py-2.5 rounded-lg flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Acceder al Panel
          </button>
        </form>
      )}
    </div>
  );
};
