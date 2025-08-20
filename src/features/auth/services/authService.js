import api from './api';

// Función para hacer login
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    return response.data;
  } catch (error) {
    // Extraer el mensaje de error del servidor
    const message = error.response?.data?.message || 'Error de conexión';
    throw new Error(message);
  }
};

// Función para registrar un nuevo usuario
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error de conexión';
    throw new Error(message);
  }
};

// Función para hacer logout
export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
    // Limpiar datos locales
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } catch (error) {
    // Incluso si falla el logout en el servidor, limpiamos datos locales
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    console.error('Error durante logout:', error);
  }
};

// Función para obtener los datos del usuario actual
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error de conexión';
    throw new Error(message);
  }
};

// Función para refrescar el token
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error de conexión';
    throw new Error(message);
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Función para obtener el usuario desde localStorage
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

// Función para cambiar contraseña
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error de conexión';
    throw new Error(message);
  }
};

// Función para solicitar recuperación de contraseña
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error de conexión';
    throw new Error(message);
  }
};

// Función para resetear contraseña
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error de conexión';
    throw new Error(message);
  }
};