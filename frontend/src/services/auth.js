import api from './api';

export const register = (name, email, password, role = 'user') =>
  api.post('/api/auth/register', { name, email, password, role });


export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const getMe = () => api.get('/api/auth/me');
