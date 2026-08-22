import { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Paper } from '@mui/material';
import {
  BarChart2, BrainCircuit, TrendingUp, Users
} from 'lucide-react';
import {
  AssessmentRounded, PeopleRounded, TrendingUpRounded, AutoAwesomeRounded
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboard';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/StatsCard';
import CancerGroupBadge from '../components/CancerGroupBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Box sx={{ minHeight: '100vh', background: '#08080f', pt: 10, pb: 6, px: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{
          background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.7))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>
          Here's the overview of the cancer detection system.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress sx={{ color: '#818cf8' }} />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Predictions"
                value={stats?.total_predictions ?? 0}
                subtitle="All time"
                icon={<AssessmentRounded />}
                color="#818cf8"
                trend={stats?.recent_predictions_count}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Users"
                value={stats?.total_users ?? 0}
                subtitle="Registered accounts"
                icon={<PeopleRounded />}
                color="#c084fc"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Avg Confidence"
                value={stats ? `${Math.round(stats.average_confidence * 100)}%` : '—'}
                subtitle="Across all predictions"
                icon={<TrendingUpRounded />}
                color="#4ade80"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Cancer Groups"
                value={stats?.predictions_by_group?.length ?? 0}
                subtitle="Active in system"
                icon={<AutoAwesomeRounded />}
                color="#fb923c"
              />
            </Grid>
          </Grid>

          {/* Breakdown by cancer group */}
          <Paper elevation={0} sx={{
            p: 3, borderRadius: 3,
            background: 'rgba(15,15,45,0.9)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'white', mb: 3 }}>
              Predictions by Cancer Group
            </Typography>
            {(!stats?.predictions_by_group || stats.predictions_by_group.length === 0) ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.3)' }}>
                <Typography>No predictions yet. <span
                  onClick={() => navigate('/analyze')}
                  style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 700 }}
                >Upload your first image →</span></Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {stats.predictions_by_group
                  .sort((a, b) => b.count - a.count)
                  .map((item) => {
                    const maxCount = Math.max(...stats.predictions_by_group.map((g) => g.count));
                    const pct = (item.count / maxCount) * 100;
                    return (
                      <Box key={item.cancer_group} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 160, flexShrink: 0 }}>
                          <CancerGroupBadge group={item.cancer_group} />
                        </Box>
                        <Box sx={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 5, height: 8, overflow: 'hidden' }}>
                          <Box sx={{
                            height: '100%',
                            width: `${pct}%`,
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            borderRadius: 5,
                            transition: 'width 1s ease',
                          }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', width: 30, textAlign: 'right', fontWeight: 700 }}>
                          {item.count}
                        </Typography>
                      </Box>
                    );
                  })}
              </Box>
            )}
          </Paper>

          {/* Quick action */}
          <Box
            onClick={() => navigate('/analyze')}
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
              border: '1px solid rgba(99,102,241,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 30px rgba(99,102,241,0.2)' },
            }}
          >
            <AutoAwesomeRounded sx={{ color: '#818cf8', fontSize: 32 }} />
            <Box>
              <Typography fontWeight={700} sx={{ color: 'white' }}>Analyze a New Image</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                Upload any medical image to get an instant AI classification + Grad-CAM visualization.
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
