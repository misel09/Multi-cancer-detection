import api from './api';

export const uploadImage = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/api/predictions', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const listPredictions = (skip = 0, limit = 50) =>
  api.get('/api/predictions', { params: { skip, limit } });

export const getPrediction = (id) => api.get(`/api/predictions/${id}`);

export const deletePrediction = (id) => api.delete(`/api/predictions/${id}`);

export const updatePredictionStatus = (id, status, doctor_comments) =>
  api.patch(`/api/predictions/${id}/status`, { status, doctor_comments });
