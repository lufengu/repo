import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'

import Login from './features/auth/pages/Login'
import Dashboard from './features/dashboard/pages/Dashboard'
import AdminDashboard from './features/dashboard/pages/AdminDashboard'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* <Route path="/admin" element={<AdminPanel />} /> */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
