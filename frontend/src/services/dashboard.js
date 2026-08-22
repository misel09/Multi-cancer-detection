import api from './api';

export const getDashboardStats = () => api.get('/api/dashboard/statistics');
export const getModelInfo = () => api.get('/api/model/info');
