// Servicio de autenticación - maneja el login de usuarios
export const loginUser = async (email, password) => {
  try {
    // Por ahora simulamos una API call - en el futuro aquí iría tu endpoint real
    // Como no tenemos backend, creamos usuarios falsos para probar
    
    // Simulamos un pequeño delay como si fuera una petición real
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Usuarios de prueba - en producción esto vendría de tu base de datos
    const mockUsers = [
      {
        id: '1',
        email: 'usuario@test.com',
        password: '123456',
        name: 'Usuario Demo',
        role: 'user'
      },
      {
        id: '2',
        email: 'admin@test.com',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin'
      }
    ];
    
    // Buscamos si existe un usuario con ese email y password
    const user = mockUsers.find(
      u => u.email === email && u.password === password
    );
    
    if (!user) {
      throw new Error('Credenciales incorrectas');
    }
    
    // Si el usuario existe, devolvemos los datos (sin la password por seguridad)
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: `mock_token_${user.id}` // Token falso para pruebas
    };
    
  } catch (error) {
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};

// Función para verificar si el usuario está logueado
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Función para obtener los datos del usuario actual
export const getCurrentUser = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};