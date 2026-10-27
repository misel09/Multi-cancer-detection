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
    <Box sx={{ pt: 4, pb: 6, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>

        {/* ── Header ── */}
        <Typography variant="h4" sx={{ color: '#1e1b3a', mb: 1 }}>
          Image Analysis
        </Typography>
        <Typography variant="body1" sx={{ color: '#9b96c4', mb: 4 }}>
          Upload a medical image to receive an AI-powered cancer classification with Grad-CAM visualization.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
        )}

        {/* ── Drop Zone ── */}
        <Paper
          {...getRootProps()}
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            border: `2px dashed ${isDragActive ? '#7c6af5' : 'rgba(124,106,245,0.3)'}`,
            background: isDragActive ? 'rgba(124,106,245,0.04)' : '#faf9ff',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
            boxShadow: isDragActive ? '0 0 0 4px rgba(124,106,245,0.1)' : 'none',
            '&:hover': {
              border: '2px dashed #7c6af5',
              background: 'rgba(124,106,245,0.03)',
            },
          }}
        >
          <input {...getInputProps()} id="image-upload-input" />
          {preview ? (
            <Box>
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxHeight: 260, maxWidth: '100%',
                  borderRadius: 12, marginBottom: 16,
                  boxShadow: '0 8px 30px rgba(124,106,245,0.15)',
                }}
              />
              <Typography variant="body2" sx={{ color: '#9b96c4' }}>
                {file?.name} ({(file?.size / 1024).toFixed(1)} KB)
              </Typography>
              <Typography variant="caption" sx={{ color: '#7c6af5', fontWeight: 600 }}>
                Click or drag to replace
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{
                width: 80, height: 80, borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(124,106,245,0.15), rgba(167,139,250,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
              }}>
                <CloudUploadRounded sx={{ fontSize: 40, color: '#7c6af5' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1e1b3a', mb: 1 }}>
                {isDragActive ? 'Drop it here!' : 'Drag & drop an image'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#9b96c4' }}>
                or click to browse · JPEG, PNG, WEBP · max 10 MB
              </Typography>
            </Box>
          )}
        </Paper>

        {/* ── Controls ── */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            id="analyze-btn"
            variant="contained"
            size="large"
            disabled={!file || loading || success}
            onClick={handleAnalyze}
            startIcon={success ? <CheckCircleRounded /> : loading ? null : <ImageRounded />}
            sx={{
              flex: 1, py: 1.5,
              background: success
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'linear-gradient(135deg, #7c6af5, #a78bfa)',
              fontWeight: 700, fontSize: 15, borderRadius: 2,
              boxShadow: success
                ? '0 4px 14px rgba(34,197,94,0.35)'
                : '0 4px 14px rgba(124,106,245,0.35)',
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
                borderColor: 'rgba(124,106,245,0.3)',
                color: '#7c6af5',
                borderRadius: 2,
                '&:hover': { background: 'rgba(124,106,245,0.06)', borderColor: '#7c6af5' },
              }}
            >
              Clear
            </Button>
          )}
        </Box>

        {loading && (
          <LinearProgress sx={{
            mt: 2, borderRadius: 5,
            background: 'rgba(124,106,245,0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #7c6af5, #a78bfa)',
            },
          }} />
        )}

        {/* ── Tips ── */}
        <Paper elevation={0} sx={{
          mt: 4, p: 3, borderRadius: 3,
          background: '#f8f7ff',
          border: '1px solid rgba(124,106,245,0.15)',
          boxShadow: 'none',
        }}>
          <Typography variant="subtitle2" sx={{ color: '#7c6af5', mb: 1.5 }}>
            💡 Tips for best results
          </Typography>
          {[
            'Use high-resolution images (min 224×224 px)',
            'Ensure the image is clearly focused on the tissue/region of interest',
            'Supported: histopathology slides, MRI, CT, dermoscopy',
          ].map((tip) => (
            <Typography key={tip} variant="caption" sx={{ color: '#9b96c4', display: 'block', mb: 0.5 }}>
              ✦ {tip}
            </Typography>
          ))}
        </Paper>

      </Box>
    </Box>
  );
}
