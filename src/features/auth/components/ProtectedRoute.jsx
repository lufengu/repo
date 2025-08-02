import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente para rutas que requieren autenticación
export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole) {
    const userRole = user?.rol || user?.role;
    
    // Verificar diferentes variaciones de roles de admin
    const isUserAdmin = userRole === 'administrador' || userRole === 'admin';
    const requiresAdmin = requiredRole === 'admin' || requiredRole === 'administrador';
    
    if (requiresAdmin && !isUserAdmin) {
      // Si requiere admin pero el usuario no es admin, redirigir a dashboard normal
      return <Navigate to="/dashboard" replace />;
    } else if (!requiresAdmin && userRole !== requiredRole) {
      // Para otros roles específicos
      const redirectPath = isUserAdmin ? '/admin' : '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

// Componente para rutas que solo pueden acceder usuarios no autenticados (como login)
export const PublicRoute = ({ children }) => {
  const { isLoggedIn, user, loading } = useAuth();

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si ya está autenticado, redirigir al dashboard correspondiente
  if (isLoggedIn) {
    const userRole = user?.rol || user?.role;
    const redirectPath = (userRole === 'admin' || userRole === 'administrador') ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
