import { Box, Typography, Paper } from '@mui/material';
import { TrendingUpRounded } from '@mui/icons-material';

export default function StatsCard({ title, value, subtitle, icon, color = '#7c6af5', trend }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2.5, borderRadius: 3,
        background: '#ffffff',
        border: '1px solid rgba(124,106,245,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 10px 30px ${color}25`,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#9b96c4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ color: '#1e1b3a', mt: 0.5, lineHeight: 1.1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#9b96c4', mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2.5,
          background: `linear-gradient(135deg, ${color}20, ${color}10)`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </Box>
      </Box>
      {trend != null && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
          <TrendingUpRounded sx={{ fontSize: 16, color: '#22c55e' }} />
          <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 600 }}>
            {trend} this week
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
