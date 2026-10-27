import api from './api';

export const getProfile     = ()        => api.get('/api/profile');
export const updateProfile  = (data)    => api.patch('/api/profile', data);
export const changePassword = (data)    => api.patch('/api/profile/password', data);
