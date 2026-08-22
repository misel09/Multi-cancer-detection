import { Box, Typography, Skeleton } from '@mui/material';
import { ZoomIn } from '@mui/icons-material';
import { useState } from 'react';

export default function GradCamViewer({ gradcamSrc, originalUrl, cancerGroup }) {
  const [showOverlay, setShowOverlay] = useState(true);

  if (!gradcamSrc) {
    return (
      <Box sx={{
        border: '1px dashed rgba(99,102,241,0.3)',
        borderRadius: 3,
        p: 4,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
      }}>
        <ZoomIn sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
        <Typography variant="body2">Grad-CAM visualization not available</Typography>
      </Box>
    );
  }

  const src = gradcamSrc;

  return (
    <Box>
      {/* Toggle */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        {['Grad-CAM Overlay', 'Original'].map((label, i) => (
          <Box
            key={label}
            onClick={() => setShowOverlay(i === 0)}
            sx={{
              px: 2, py: 0.5, borderRadius: 2, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: (i === 0) === showOverlay ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
              color: (i === 0) === showOverlay ? '#818cf8' : 'rgba(255,255,255,0.5)',
              border: '1px solid',
              borderColor: (i === 0) === showOverlay ? 'rgba(99,102,241,0.4)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </Box>
        ))}
      </Box>

      {/* Image */}
      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(99,102,241,0.2)',
          position: 'relative',
          '&:hover img': { transform: 'scale(1.02)' },
        }}
      >
        <img
          src={showOverlay ? src : (originalUrl || src)}
          alt={`Grad-CAM for ${cancerGroup}`}
          style={{ width: '100%', display: 'block', transition: 'transform 0.3s ease' }}
        />
        <Box sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: 1,
          px: 1,
          py: 0.2,
          fontSize: 11,
          color: 'rgba(255,255,255,0.7)',
        }}>
          {showOverlay ? 'Grad-CAM Heatmap' : 'Original Image'}
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mt: 1 }}>
        Highlighted regions indicate areas the model focused on for the {cancerGroup} prediction.
      </Typography>
    </Box>
  );
}
