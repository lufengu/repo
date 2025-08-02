import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Login from './features/auth/pages/Login'
import Dashboard from './features/dashboard/pages/Dashboard'
import AdminDashboard from './features/dashboard/pages/AdminDashboard'
import CreateUser from './features/dashboard/pages/CreateUser'
import { AuthProvider } from './features/auth/context/AuthContext'
import { ProtectedRoute, PublicRoute } from './features/auth/components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
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
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta alternativa de admin */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta para crear usuario - requiere autenticación y rol de admin */}
            <Route 
              path="/admin/create-user" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <CreateUser />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta para manejar rutas no encontradas */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
