import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { getDashboardStats } from '../services/dashboard';

const PIE_COLORS = ['#6366f1', '#c084fc', '#f472b6', '#fb923c', '#4ade80', '#60a5fa', '#fbbf24', '#2dd4bf'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ background: 'rgba(15,15,45,0.95)', border: '1px solid rgba(99,102,241,0.3)', p: 1.5, borderRadius: 2 }}>
      <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 700, display: 'block' }}>{label}</Typography>
      {payload.map((p) => (
        <Typography key={p.name} variant="caption" sx={{ color: 'white', display: 'block' }}>
          {p.name}: {typeof p.value === 'number' && p.value < 2 ? `${Math.round(p.value * 100)}%` : p.value}
        </Typography>
      ))}
    </Box>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const barData = stats?.predictions_by_group?.map((g) => ({
    name: g.cancer_group.replace(/ Cancer| Tumor/, ''),
    Predictions: g.count,
  })) || [];

  const pieData = stats?.predictions_by_group?.map((g) => ({
    name: g.cancer_group,
    value: g.count,
  })) || [];

  const lineData = stats?.recent_trend?.map((t) => ({
    name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Predictions: t.count,
  })) || [];

  return (
    <Box sx={{ minHeight: '100vh', background: '#08080f', pt: 10, pb: 6, px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={800} sx={{
        background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.7))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1,
      }}>
        Analytics
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', mb: 4 }}>
        Visual breakdown of all predictions across cancer groups.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress sx={{ color: '#818cf8' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Bar Chart */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(15,15,45,0.9)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'white', mb: 3 }}>
                Predictions per Cancer Group
              </Typography>
              {barData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.3)' }}>
                  <Typography>No data yet — analyze some images first.</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Predictions" radius={[4, 4, 0, 0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.9} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(15,15,45,0.9)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'white', mb: 3 }}>
                Distribution
              </Typography>
              {pieData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.3)' }}>
                  <Typography>No data yet.</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                          {value.replace(/ Cancer| Tumor/, '')}
                        </span>
                      )}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          {/* Summary stats row */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(15,15,45,0.9)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Predictions', value: stats?.total_predictions ?? 0 },
                { label: 'Total Users', value: stats?.total_users ?? 0 },
                { label: 'Avg Confidence', value: `${Math.round((stats?.average_confidence || 0) * 100)}%` },
                { label: 'Last 7 Days', value: stats?.recent_predictions_count ?? 0 },
              ].map((item) => (
                <Box key={item.label}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{item.label}</Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#818cf8' }}>{item.value}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Line Chart (Usage Over Time) */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(15,15,45,0.9)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'white', mb: 3 }}>
                System Usage (Last 7 Days)
              </Typography>
              {lineData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.3)' }}>
                  <Typography>No trend data yet.</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="Predictions"
                      stroke="#818cf8"
                      strokeWidth={3}
                      dot={{ fill: '#818cf8', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#6366f1' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
