//Aquí va la comunicación con la API del backend.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Función para crear un nuevo usuario
export const createUser = async (userData) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        rol: userData.rol
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al crear usuario');
    }

    return {
      success: true,
      message: data.message || 'Usuario creado exitosamente',
      user: data.user
    };

  } catch (error) {
    console.error('Error en createUser:', error);
    return {
      success: false,
      message: error.message || 'Error al crear usuario'
    };
  }
};

// Función para obtener un usuario por ID
export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener usuario');
    }

    return {
      success: true,
      user: data.user
    };

  } catch (error) {
    console.error('Error en getUserById:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener usuario'
    };
  }
};

// Función para actualizar un usuario
export const updateUser = async (userId, userData) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar usuario');
    }

    return {
      success: true,
      message: data.message || 'Usuario actualizado exitosamente',
      user: data.user
    };

  } catch (error) {
    console.error('Error en updateUser:', error);
    return {
      success: false,
      message: error.message || 'Error al actualizar usuario'
    };
  }
};