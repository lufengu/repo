import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import {
  FaUsers,
  FaChartBar,
  FaCogs,
  FaDatabase,
  FaDoorClosed,
  FaSpinner
} from 'react-icons/fa';
import { logoutUser } from '../../auth/services/authService';
import logo from '../../../assets/logoCompleto.png';

const AdminMenu = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeSection, 
  setActiveSection 
}) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    // Logout optimista - limpiar UI inmediatamente
    logout();
    navigate('/login');
    
    // Intentar logout en el servidor en segundo plano
    try {
      await logoutUser();
    } catch (error) {
      // Si falla el logout del servidor, no importa porque ya limpiamos el frontend
      console.warn('Error en logout del servidor:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Items del menú específicos para administrador (sin Dashboard)
  const adminNavItems = [
    { 
      name: 'Gestión de Usuarios', 
      icon: <FaUsers />, 
      action: () => {
        setActiveSection('users');
        navigate('/admin/users');
      },
      section: 'users'
    },
    { 
      name: 'Estadísticas', 
      icon: <FaChartBar />, 
      action: () => {
        setActiveSection('stats');
        navigate('/admin/stats');
      },
      section: 'stats'
    },
    { 
      name: 'Configuración', 
      icon: <FaCogs />, 
      action: () => {
        setActiveSection('settings');
        navigate('/admin/settings');
      },
      section: 'settings'
    },
    { 
      name: 'Base de Datos', 
      icon: <FaDatabase />, 
      action: () => {
        setActiveSection('database');
        navigate('/admin/database');
      },
      section: 'database'
    },
  ];

  return (
    <>
      {/* Barra lateral */}
      <div className={`fixed bg-white w-64 h-screen shadow-lg transform transition-transform duration-300 z-30 flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} lg:translate-x-0 lg:static lg:z-auto`}>

        <div className='p-6 flex justify-center items-center border-b border-gray-200 relative'>
          <img src={logo} alt="Logo TechDero" className='w-34 h-34 object-contain' />
          <button 
            className='lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700' 
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Información del admin */}
        <div className='px-4 py-3 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>
                {user?.nombre?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className='text-gray-800 text-sm font-medium'>{user?.nombre || user?.name || 'Administrador'}</p>
              <p className='text-gray-500 text-xs'>Administrador</p>
            </div>
          </div>
        </div>

        {/* Barra de navegación */}
        <div className='flex-1 px-4 py-6 space-y-2'>
          {adminNavItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-500 hover:text-white transition-all cursor-pointer text-gray-700 ${
                activeSection === item.section ? 'bg-orange-500 text-white' : ''
              }`}
              onClick={item.action}
            >
              <div className="text-lg">{item.icon}</div>
              <div className="text-sm font-medium">{item.name}</div>
            </div>
          ))}
        </div>

        {/* Cerrar Sesión al final */}
        <div className='px-4 pb-4'>
          <div className='border-t border-gray-200 pt-4'>
            <div
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                isLoggingOut 
                  ? 'bg-red-400 text-white cursor-not-allowed opacity-75' 
                  : 'hover:bg-red-500 hover:text-white text-gray-700'
              }`}
              onClick={isLoggingOut ? undefined : handleLogout}
            >
              <div className="text-lg">
                {isLoggingOut ? <FaSpinner className="animate-spin" /> : <FaDoorClosed />}
              </div>
              <div className="text-sm font-medium">
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default AdminMenu;