import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box, Typography, Button, CircularProgress,
  Alert, Paper, LinearProgress
} from '@mui/material';
import {
  CloudUploadRounded, ImageRounded, CheckCircleRounded
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePredictions } from '../hooks/usePredictions';

export default function ImageAnalysis() {
  const { upload, loading, error } = usePredictions();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((accepted) => {
    if (!accepted.length) return;
    const f = accepted[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSuccess(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    try {
      const result = await upload(file);
      setSuccess(true);
      setTimeout(() => navigate(`/result/${result.id}`), 800);
    } catch (_) {}
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#08080f', pt: 10, pb: 6, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={800} sx={{
          background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.7))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1,
        }}>
          Image Analysis
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', mb: 4 }}>
          Upload a medical image to receive an AI-powered cancer classification with Grad-CAM visualization.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </Alert>
        )}

        {/* Drop Zone */}
        <Paper
          {...getRootProps()}
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            border: `2px dashed ${isDragActive ? '#818cf8' : 'rgba(99,102,241,0.3)'}`,
            background: isDragActive ? 'rgba(99,102,241,0.08)' : 'rgba(15,15,45,0.6)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
            '&:hover': {
              border: '2px dashed #818cf8',
              background: 'rgba(99,102,241,0.05)',
            },
          }}
        >
          <input {...getInputProps()} id="image-upload-input" />
          {preview ? (
            <Box>
              <img
                src={preview}
                alt="Preview"
                style={{ maxHeight: 260, maxWidth: '100%', borderRadius: 12, marginBottom: 16 }}
              />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {file?.name} ({(file?.size / 1024).toFixed(1)} KB)
              </Typography>
              <Typography variant="caption" sx={{ color: '#818cf8' }}>
                Click or drag to replace
              </Typography>
            </Box>
          ) : (
            <Box>
              <CloudUploadRounded sx={{ fontSize: 56, color: '#818cf8', opacity: 0.7, mb: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: 'white', mb: 1 }}>
                {isDragActive ? 'Drop it here!' : 'Drag & drop an image'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                or click to browse · JPEG, PNG, WEBP · max 10 MB
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            id="analyze-btn"
            variant="contained"
            size="large"
            disabled={!file || loading || success}
            onClick={handleAnalyze}
            startIcon={success ? <CheckCircleRounded /> : loading ? null : <ImageRounded />}
            sx={{
              flex: 1,
              py: 1.5,
              background: success
                ? 'linear-gradient(135deg, #16a34a, #4ade80)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            {success ? 'Done! Redirecting…' : loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                Analyzing…
              </Box>
            ) : 'Analyze Image'}
          </Button>

          {preview && !loading && (
            <Button
              variant="outlined"
              size="large"
              onClick={() => { setFile(null); setPreview(null); setSuccess(false); }}
              sx={{
                py: 1.5,
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Clear
            </Button>
          )}
        </Box>

        {loading && <LinearProgress sx={{ mt: 2, borderRadius: 5, background: 'rgba(99,102,241,0.1)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' } }} />}

        {/* Tips */}
        <Paper elevation={0} sx={{ mt: 4, p: 3, borderRadius: 3, background: 'rgba(15,15,45,0.6)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#818cf8', mb: 1.5 }}>
            Tips for best results
          </Typography>
          {[
            'Use high-resolution images (min 224×224 px)',
            'Ensure the image is clearly focused on the tissue/region of interest',
            'Supported: histopathology slides, MRI, CT, dermoscopy',
          ].map((tip) => (
            <Typography key={tip} variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.5 }}>
              ✦ {tip}
            </Typography>
          ))}
        </Paper>
      </Box>
    </Box>
  );
}
