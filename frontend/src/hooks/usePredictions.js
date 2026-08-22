import { useState, useCallback } from 'react';
import { listPredictions, uploadImage, deletePrediction } from '../services/predictions';

export function usePredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPredictions();
      setPredictions(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  }, []);

  const upload = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const res = await uploadImage(file);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.detail || 'Upload failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    await deletePrediction(id);
    setPredictions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { predictions, loading, error, fetchAll, upload, remove };
}
