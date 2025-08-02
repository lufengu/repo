import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, isAuthenticated, getCurrentUser } from '../services/authService';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Función para hacer login
  const login = (userData, token) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('authToken', token); // Mantener compatibilidad
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  // Función para hacer logout optimizado
  const logout = () => {
    // Limpiar estado inmediatamente para respuesta rápida
    setUser(null);
    setIsLoggedIn(false);
    
    // Limpiar localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  // Función para actualizar los datos del usuario
  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const storedUser = getStoredUser();
          if (storedUser) {
            // Verificar que el token sigue siendo válido
            try {
              const currentUser = await getCurrentUser();
              setUser(currentUser.user || currentUser);
              setIsLoggedIn(true);
            } catch (error) {
              // Si el token no es válido, hacer logout
              console.error('Token inválido:', error);
              logout();
            }
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    isLoggedIn,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
