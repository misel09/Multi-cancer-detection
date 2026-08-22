import { Box, Typography, Paper } from '@mui/material';
import { TrendingUpRounded } from '@mui/icons-material';

export default function StatsCard({ title, value, subtitle, icon, color = '#818cf8', trend }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(20,20,60,0.9) 0%, rgba(15,15,45,0.9) 100%)',
        border: '1px solid rgba(99,102,241,0.15)',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 30px ${color}22`,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ color, mt: 0.5, lineHeight: 1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: `${color}22`,
            border: `1px solid ${color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </Box>
      </Box>
      {trend != null && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
          <TrendingUpRounded sx={{ fontSize: 16, color: '#4ade80' }} />
          <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 600 }}>
            {trend} this week
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
