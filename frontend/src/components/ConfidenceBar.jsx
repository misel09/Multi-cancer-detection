import { Box, Typography, LinearProgress } from '@mui/material';

function getColor(confidence) {
  if (confidence >= 0.85) return '#4ade80';
  if (confidence >= 0.65) return '#facc15';
  return '#f87171';
}

export default function ConfidenceBar({ confidence }) {
  const pct = Math.round(confidence * 100);
  const color = getColor(confidence);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
          Confidence Score
        </Typography>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ color, lineHeight: 1 }}
        >
          {pct}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 10,
          borderRadius: 5,
          background: 'rgba(255,255,255,0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 5,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            transition: 'width 1s ease',
          },
        }}
      />
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', mt: 0.5, display: 'block' }}>
        {confidence >= 0.85 ? 'High confidence' : confidence >= 0.65 ? 'Moderate confidence' : 'Low confidence'}
      </Typography>
    </Box>
  );
}
