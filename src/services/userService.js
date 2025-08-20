import api from '../features/auth/services/api';

// Función para obtener la lista de usuarios (solo admin)
export const getUsers = async (page = 1, limit = 10, search = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    const response = await api.get(`/users?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error en getUsers:', error);
    const message = error.response?.data?.message || 'Error al obtener usuarios';
    throw new Error(message);
  }
};

// Función para obtener un usuario específico
export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error al obtener usuario';
    throw new Error(message);
  }
};

// Función para crear un nuevo usuario (solo admin)
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error al crear usuario';
    throw new Error(message);
  }
};

// Función para actualizar un usuario
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error al actualizar usuario';
    throw new Error(message);
  }
};

// Función para eliminar un usuario (solo admin)
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error al eliminar usuario';
    throw new Error(message);
  }
};

// Función para cambiar el rol de un usuario (solo admin)
export const changeUserRole = async (userId, newRole) => {
  try {
    const response = await api.put(`/users/${userId}/role`, { role: newRole });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error al cambiar rol';
    throw new Error(message);
  }
};

// Función para activar/desactivar un usuario (solo admin)
export const toggleUserStatus = async (userId, activate = true) => {
  try {
    const endpoint = activate ? 'activate' : 'deactivate';
    const response = await api.patch(`/users/${userId}/${endpoint}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error al cambiar estado del usuario';
    throw new Error(message);
  }
};

// Función para obtener estadísticas de usuarios (solo admin)
export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error al obtener estadísticas';
    throw new Error(message);
  }
};
