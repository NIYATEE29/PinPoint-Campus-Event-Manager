const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Auth API
export const authAPI = {
  // Register
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Login
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },
};

// Events API
export const eventsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/events`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/events/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  create: async (eventData) => {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  update: async (id, eventData) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  join: async (id) => {
    const response = await fetch(`${API_URL}/events/${id}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },


  save: async (id) => {
    const response = await fetch(`${API_URL}/events/${id}/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },
};

// User API
export const userAPI = {

  getProfile: async () => {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  updateProfile: async (userData) => {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  getSavedEvents: async () => {
    const response = await fetch(`${API_URL}/user/saved-events`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  getJoinedEvents: async () => {
    const response = await fetch(`${API_URL}/user/joined-events`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  getMyEvents: async () => {
    const response = await fetch(`${API_URL}/user/my-events`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },
};

// Clubs API
export const clubsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/clubs`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },
};
