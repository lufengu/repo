import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './features/auth/context/AuthContext'
import { ProtectedRoute, PublicRoute } from './features/auth/components/ProtectedRoute'
import { useEffect, useRef } from "react";
import { verifyServiceStatus } from "./services/healthService";

import Login from './features/auth/pages/Login'
import Dashboard from './features/dashboard/pages/Dashboard'
import AdminDashboard from './features/dashboard/pages/AdminDashboard'
import CreateUser from './features/dashboard/pages/CreateUser'
import './App.css'
import Inventario from './features/inventario/pages/inventario'
import Ventas from './features/ventas/pages/Ventas'
import RecomendacionesFloatingButton from './features/dashboard/components/RecomendacionesFloatingButton'
import './features/dashboard/components/RecomendacionesFloatingButton.css'
import ProveedoresPage from './features/proveedores/pages/proveedores';
import PedidosPage from './features/pedidos/pages/PedidosPage';


function AppRoutes() {
  const location = useLocation();
  const didCheckRef = useRef(false);

  useEffect(() => {
    if (didCheckRef.current) return;
    didCheckRef.current = true;
    (async () => {
      const result = await verifyServiceStatus();
      if (result.ok) {
        console.info("Servicio backend OK:", result.data);
      } else {
        console.warn("Backend no disponible:", result.status, result.error, result.data);
      }
    })();
  }, []);

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
        {/* Ruta para pedidos - requiere autenticación */}
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute>
              <PedidosPage />
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
  const didRunRef = useRef(false); // evita doble llamada en StrictMode

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App
