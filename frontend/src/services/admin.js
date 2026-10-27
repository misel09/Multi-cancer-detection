import api from './api';

export const getAdminStats   = ()              => api.get('/api/admin/stats');
export const getAdminUsers   = ()              => api.get('/api/admin/users');
export const updateUserRole  = (id, role)      => api.patch(`/api/admin/users/${id}/role`,   { role });
export const updateUserActive = (id, is_active) => api.patch(`/api/admin/users/${id}/active`, { is_active });
