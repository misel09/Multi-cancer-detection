import { Box, Typography, LinearProgress } from '@mui/material';

function getColor(c) {
  if (c >= 0.85) return '#22c55e';
  if (c >= 0.65) return '#f59e0b';
  return '#ef4444';
}

export default function ConfidenceBar({ confidence }) {
  const pct   = Math.round(confidence * 100);
  const color = getColor(confidence);
  const label = confidence >= 0.85 ? 'High confidence' : confidence >= 0.65 ? 'Moderate confidence' : 'Low confidence';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography variant="caption" sx={{ color: '#6b7094', fontWeight: 600 }}>
          Confidence Score
        </Typography>
        <Typography variant="h6" fontWeight={800} sx={{ color, lineHeight: 1 }}>
          {pct}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 10, borderRadius: 5,
          background: 'rgba(124,106,245,0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 5,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            transition: 'width 1s ease',
          },
        }}
      />
      <Typography variant="caption" sx={{ color: '#9b96c4', mt: 0.5, display: 'block' }}>
        {label}
      </Typography>
    </Box>
  );
}
