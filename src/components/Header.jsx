import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import { logoutUser } from '../features/auth/services/authService';

export const Header = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    // Logout- limpiar UI inmediatamente
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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Título de la página */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>

          {/* Información del usuario y opciones */}
          <div className="flex items-center space-x-4">
            {/* Información del usuario */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{user?.name || user?.email}</p>
                  <p className="text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-2">
              {/* Botón de configuración (placeholder) */}
              <button
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Configuración"
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* Botón de logout */}
              <button
                onClick={isLoggingOut ? undefined : handleLogout}
                disabled={isLoggingOut}
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isLoggingOut 
                    ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>{isLoggingOut ? 'Cerrando...' : 'Salir'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
