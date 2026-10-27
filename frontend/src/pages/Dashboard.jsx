import { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, CircularProgress, Paper,
  Chip, Button, Avatar, Skeleton
} from '@mui/material';
import {
  AssessmentRounded, PeopleRounded, TrendingUpRounded,
  AutoAwesomeRounded, ArrowForwardRounded, CloudUploadRounded,
  HistoryRounded, AnalyticsRounded, CheckCircleRounded,
  CancelRounded, HourglassEmptyRounded
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboard';
import { listPredictions } from '../services/predictions';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/StatsCard';
import CancerGroupBadge from '../components/CancerGroupBadge';

const STATUS_CFG = {
  VERIFIED: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)',  icon: <CheckCircleRounded sx={{ fontSize: 14 }} /> },
  REJECTED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  icon: <CancelRounded sx={{ fontSize: 14 }} /> },
  PENDING:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: <HourglassEmptyRounded sx={{ fontSize: 14 }} /> },
};

const QUICK_ACTIONS = [
  { label: 'Analyze Image', path: '/analyze',   icon: <CloudUploadRounded />, color: '#7c6af5', desc: 'Upload & classify a new scan' },
  { label: 'View History',  path: '/history',   icon: <HistoryRounded />,     color: '#a78bfa', desc: 'Browse all past results' },
  { label: 'Analytics',     path: '/analytics', icon: <AnalyticsRounded />,   color: '#3b82f6', desc: 'Charts & trends' },
];

const CARD_SX = {
  p: 3, borderRadius: 3,
  background: '#ffffff',
  border: '1px solid rgba(124,106,245,0.1)',
  boxShadow: '0 4px 20px rgba(124,106,245,0.07)',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [recentPreds, setRecentPreds] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [predsLoading, setPredsLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setStatsLoading(false));

    listPredictions(0, 5)
      .then((r) => setRecentPreds(r.data))
      .catch(console.error)
      .finally(() => setPredsLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Box sx={{ pt: 4, pb: 6, px: { xs: 2, md: 4 } }}>

      {/* ── Greeting ── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#1e1b3a' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body1" sx={{ color: '#9b96c4', mt: 0.5 }}>
          Here's what's happening with your cancer detection system today.
        </Typography>
      </Box>

      {/* ── Stats Cards ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Predictions', value: stats?.total_predictions ?? 0,   subtitle: 'All time',            icon: <AssessmentRounded />, color: '#7c6af5', trend: stats?.recent_predictions_count },
          { title: 'Total Users',       value: stats?.total_users ?? 0,          subtitle: 'Registered accounts', icon: <PeopleRounded />,     color: '#a78bfa' },
          { title: 'Avg Confidence',    value: stats ? `${Math.round(stats.average_confidence * 100)}%` : '—', subtitle: 'Across all predictions', icon: <TrendingUpRounded />, color: '#22c55e' },
          { title: 'Cancer Groups',     value: stats?.predictions_by_group?.length ?? 0, subtitle: 'Active in system', icon: <AutoAwesomeRounded />, color: '#3b82f6' },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            {statsLoading
              ? <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3, bgcolor: 'rgba(124,106,245,0.07)' }} />
              : <StatsCard {...card} />
            }
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>

        {/* ── Recent Predictions ── */}
        <Grid item xs={12} md={7}>
          <Paper elevation={1} sx={{ ...CARD_SX, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#1e1b3a' }}>Recent Predictions</Typography>
              <Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => navigate('/history')}
                sx={{ color: '#7c6af5', fontWeight: 600 }}>
                View all
              </Button>
            </Box>

            {predsLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2, bgcolor: 'rgba(124,106,245,0.06)' }} />
                ))}
              </Box>
            ) : recentPreds.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CloudUploadRounded sx={{ fontSize: 48, color: 'rgba(124,106,245,0.2)', mb: 1 }} />
                <Typography sx={{ color: '#9b96c4' }}>No predictions yet.</Typography>
                <Button variant="contained" size="small" onClick={() => navigate('/analyze')}
                  sx={{ mt: 2, borderRadius: 2 }}>
                  Analyze your first image
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {recentPreds.map((p) => {
                  const s = STATUS_CFG[p.status] || STATUS_CFG.PENDING;
                  return (
                    <Box
                      key={p.id}
                      onClick={() => navigate(`/result/${p.id}`)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        p: 1.5, borderRadius: 2, cursor: 'pointer',
                        border: '1px solid transparent',
                        transition: 'all 0.15s',
                        '&:hover': {
                          background: 'rgba(124,106,245,0.05)',
                          border: '1px solid rgba(124,106,245,0.15)',
                        },
                      }}
                    >
                      <Avatar sx={{ width: 36, height: 36, background: 'rgba(124,106,245,0.1)', color: '#7c6af5', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        #{p.id}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} fontSize={13} sx={{ color: '#1e1b3a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.cancer_subtype}
                        </Typography>
                        <Typography fontSize={11} sx={{ color: '#9b96c4' }}>
                          {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Box>
                      <Box sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                        <CancerGroupBadge group={p.cancer_group} />
                      </Box>
                      <Typography fontSize={13} fontWeight={800} sx={{ color: '#7c6af5', flexShrink: 0, width: 40, textAlign: 'right' }}>
                        {Math.round(p.confidence * 100)}%
                      </Typography>
                      <Chip
                        label={p.status || 'PENDING'} size="small" icon={s.icon}
                        sx={{
                          fontSize: 10, fontWeight: 700, flexShrink: 0,
                          color: s.color, background: s.bg, border: `1px solid ${s.border}`,
                          '& .MuiChip-icon': { color: s.color },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* ── Quick Actions ── */}
        <Grid item xs={12} md={5}>
          <Paper elevation={1} sx={{ ...CARD_SX, height: '100%' }}>
            <Typography variant="h6" sx={{ color: '#1e1b3a', mb: 3 }}>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {QUICK_ACTIONS.map((action) => (
                <Box
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    p: 2, borderRadius: 2.5, cursor: 'pointer',
                    background: '#f8f7ff',
                    border: '1px solid rgba(124,106,245,0.1)',
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      background: `${action.color}0d`,
                      border: `1px solid ${action.color}40`,
                      transform: 'translateX(4px)',
                      boxShadow: `0 4px 16px ${action.color}20`,
                    },
                  }}
                >
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2,
                    background: `${action.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: action.color, flexShrink: 0,
                  }}>
                    {action.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} fontSize={14} sx={{ color: '#1e1b3a' }}>{action.label}</Typography>
                    <Typography fontSize={12} sx={{ color: '#9b96c4' }}>{action.desc}</Typography>
                  </Box>
                  <ArrowForwardRounded sx={{ color: '#c4bfe8', fontSize: 18 }} />
                </Box>
              ))}
            </Box>

            {/* System status */}
            <Box sx={{
              mt: 3, p: 2, borderRadius: 2.5,
              background: 'rgba(124,106,245,0.06)',
              border: '1px solid rgba(124,106,245,0.15)',
              display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.6)', flexShrink: 0 }} />
              <Box>
                <Typography fontSize={12} fontWeight={700} sx={{ color: '#7c6af5' }}>System Online</Typography>
                <Typography fontSize={11} sx={{ color: '#9b96c4' }}>
                  {stats?.recent_predictions_count ?? 0} analyses run in the last 7 days
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
