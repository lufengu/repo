import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'

import Login from './features/auth/pages/Login'
import Dashboard from './features/dashboard/pages/Dashboard'
import AdminDashboard from './features/dashboard/pages/AdminDashboard'
import CreateUser from './features/dashboard/pages/CreateUser'
import { AuthProvider } from './features/auth/context/AuthContext'
import { ProtectedRoute, PublicRoute } from './features/auth/components/ProtectedRoute'
import './App.css'
import Inventario from './features/inventario/pages/inventario'
import Ventas from './features/ventas/pages/Ventas'
import RecomendacionesFloatingButton from './features/dashboard/components/RecomendacionesFloatingButton'
import './features/dashboard/components/RecomendacionesFloatingButton.css'
import ProveedoresPage from './features/proveedores/pages/proveedores';


function AppRoutes() {
  const location = useLocation();

  return (
    <div className="App">
      <Routes>
        {/* Ruta por defecto - redirige al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Ruta pública - solo accesible si no está autenticado */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Rutas protegidas - requieren autenticación */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta de admin - requiere autenticación y rol de admin */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="administrador">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta alternativa de admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="administrador">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta para crear usuario - requiere autenticación y rol de admin */}
        <Route 
          path="/admin/create-user" 
          element={
            <ProtectedRoute requiredRole="administrador">
              <CreateUser />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta para inventario - requiere autenticación */}
        <Route 
          path="/inventario" 
          element={
            <ProtectedRoute>
              <Inventario />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta para ventas - requiere autenticación */}
        <Route 
          path="/ventas" 
          element={
            <ProtectedRoute>
              <Ventas />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta para proveedores - requiere autenticación */}
        <Route 
          path="/proveedores" 
          element={
            <ProtectedRoute>
              <ProveedoresPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta para manejar rutas no encontradas */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      {location.pathname !== '/login' && <RecomendacionesFloatingButton />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App
