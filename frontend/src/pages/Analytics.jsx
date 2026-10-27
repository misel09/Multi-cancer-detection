import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Divider } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar,
  ComposedChart, Line, Scatter, ScatterChart, ZAxis,
} from 'recharts';
import { getDashboardStats } from '../services/dashboard';
import {
  AssessmentRounded, PeopleRounded, TrendingUpRounded,
  AutoAwesomeRounded, ShowChartRounded, DonutLargeRounded,
  RadarRounded, BarChartRounded,
} from '@mui/icons-material';

// ── Palette ───────────────────────────────────────────────────────────────────
const P = ['#7c6af5','#a78bfa','#f472b6','#fb923c','#22c55e','#3b82f6','#f59e0b','#2dd4bf'];

// ── Shared tooltip ────────────────────────────────────────────────────────────
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: 'rgba(255,255,255,0.98)',
      border: '1px solid rgba(124,106,245,0.2)',
      p: 1.5, borderRadius: 2,
      boxShadow: '0 8px 24px rgba(124,106,245,0.15)',
    }}>
      {label && (
        <Typography variant="caption" sx={{ color: '#7c6af5', fontWeight: 700, display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
      )}
      {payload.map((p, i) => (
        <Typography key={i} variant="caption" sx={{ color: '#1e1b3a', display: 'block' }}>
          {p.name}:{' '}
          <strong style={{ color: p.color || '#7c6af5' }}>
            {typeof p.value === 'number' && p.value <= 1
              ? `${Math.round(p.value * 100)}%`
              : p.value}
          </strong>
        </Typography>
      ))}
    </Box>
  );
};

const Empty = () => (
  <Box sx={{ textAlign: 'center', py: 6 }}>
    <Typography variant="body2" sx={{ color: '#c4bfe8' }}>
      No data yet — analyze some images first.
    </Typography>
  </Box>
);

// ── Chart card wrapper ────────────────────────────────────────────────────────
const Card = ({ title, subtitle, icon, children }) => (
  <Paper elevation={1} sx={{
    p: 3, borderRadius: 3, background: '#ffffff',
    border: '1px solid rgba(124,106,245,0.1)',
    boxShadow: '0 4px 20px rgba(124,106,245,0.07)',
    height: '100%',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
      {icon && (
        <Box sx={{
          width: 34, height: 34, borderRadius: 2,
          background: 'rgba(124,106,245,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#7c6af5', flexShrink: 0,
        }}>
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="h6" sx={{ color: '#1e1b3a', lineHeight: 1.2 }}>{title}</Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#9b96c4' }}>{subtitle}</Typography>
        )}
      </Box>
    </Box>
    <Divider sx={{ mb: 2.5, mt: 1 }} />
    {children}
  </Paper>
);

// ── KPI tile ──────────────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, color = '#7c6af5', icon }) => (
  <Paper elevation={1} sx={{
    p: 2.5, borderRadius: 3, background: '#ffffff',
    border: '1px solid rgba(124,106,245,0.1)',
    boxShadow: '0 4px 20px rgba(124,106,245,0.07)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 10px 30px ${color}22` },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="caption" sx={{ color: '#9b96c4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#1e1b3a', mt: 0.5, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {sub && <Typography variant="caption" sx={{ color: '#9b96c4' }}>{sub}</Typography>}
      </Box>
      <Box sx={{
        width: 44, height: 44, borderRadius: 2.5,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groups = stats?.predictions_by_group || [];

  const barData = groups.map((g) => ({
    name:        g.cancer_group.replace(/ Cancer| Tumor/g, ''),
    Predictions: g.count,
    Confidence:  Math.round((g.avg_confidence ?? 0.75) * 100),
  }));

  const pieData = groups.map((g) => ({ name: g.cancer_group, value: g.count }));

  const areaData = (stats?.recent_trend || []).map((t) => ({
    name:        new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Predictions: t.count,
  }));

  const maxCount  = Math.max(...groups.map((g) => g.count), 1);
  const radarData = groups.map((g) => ({
    subject:    g.cancer_group.replace(/ Cancer| Tumor/g, ''),
    Volume:     Math.round((g.count / maxCount) * 100),
    Confidence: Math.round((g.avg_confidence ?? 0.75) * 100),
  }));

  const radialData = groups.map((g, i) => ({
    name:       g.cancer_group.replace(/ Cancer| Tumor/g, ''),
    Confidence: Math.round((g.avg_confidence ?? 0.75) * 100),
    fill:       P[i % P.length],
  }));

  const scatterData = groups.map((g) => ({
    x:    g.count,
    y:    Math.round((g.avg_confidence ?? 0.75) * 100),
    z:    g.count * 5 + 20,
    name: g.cancer_group.replace(/ Cancer| Tumor/g, ''),
  }));

  const axTick = { fill: '#9b96c4', fontSize: 11 };
  const cGrid  = <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,106,245,0.08)" />;

  const kpis = [
    { label: 'Total Predictions', value: stats?.total_predictions ?? 0,   sub: 'All time',        color: '#7c6af5', icon: <AssessmentRounded fontSize="small" /> },
    { label: 'Total Users',       value: stats?.total_users ?? 0,          sub: 'Registered',      color: '#a78bfa', icon: <PeopleRounded fontSize="small" /> },
    { label: 'Avg Confidence',    value: `${Math.round((stats?.average_confidence ?? 0) * 100)}%`, sub: 'Model certainty', color: '#22c55e', icon: <TrendingUpRounded fontSize="small" /> },
    { label: 'Last 7 Days',       value: stats?.recent_predictions_count ?? 0, sub: 'Recent activity', color: '#3b82f6', icon: <AutoAwesomeRounded fontSize="small" /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', pt: 4, pb: 8, px: { xs: 2, sm: 3, md: 5 }, boxSizing: 'border-box' }}>

      {/* ── Page header ── */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid rgba(124,106,245,0.12)' }}>
        <Typography variant="h4" sx={{ color: '#1e1b3a', fontWeight: 800 }}>Analytics</Typography>
        <Typography variant="body1" sx={{ color: '#9b96c4', mt: 0.5 }}>
          7 charts — trends, distributions, confidence, volume &amp; more.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress sx={{ color: '#7c6af5' }} />
        </Box>
      ) : (
        <>
          {/* ── Row 1: KPI tiles ── */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {kpis.map((k) => (
              <Grid item xs={12} sm={6} lg={3} key={k.label}>
                <KPI {...k} />
              </Grid>
            ))}
          </Grid>

          {/* ── Row 2+: Charts ── */}
          <Grid container spacing={3}>

            {/* 1. Area — Usage Over Time (full width) */}
            <Grid item xs={12}>
              <Card
                title="System Usage Over Time"
                subtitle="Predictions submitted per day — last 7 days"
                icon={<ShowChartRounded fontSize="small" />}
              >
                {areaData.length === 0 ? <Empty /> : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={areaData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#7c6af5" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#7c6af5" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      {cGrid}
                      <XAxis dataKey="name" tick={axTick} />
                      <YAxis tick={axTick} allowDecimals={false} />
                      <Tooltip content={<Tip />} />
                      <Area
                        type="monotone" dataKey="Predictions"
                        stroke="#7c6af5" strokeWidth={3}
                        fill="url(#ag)"
                        dot={{ fill: '#7c6af5', r: 5 }}
                        activeDot={{ r: 7, fill: '#a78bfa' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Grid>

            {/* 2. Composed — Bars (count) + Line (confidence) */}
            <Grid item xs={12} md={7}>
              <Card
                title="Predictions & Confidence by Group"
                subtitle="Bars = prediction count · Line = avg confidence %"
                icon={<BarChartRounded fontSize="small" />}
              >
                {barData.length === 0 ? <Empty /> : (
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={barData} margin={{ top: 5, right: 20, left: -20, bottom: 55 }}>
                      {cGrid}
                      <XAxis dataKey="name" tick={axTick} angle={-35} textAnchor="end" />
                      <YAxis yAxisId="left"  tick={axTick} />
                      <YAxis yAxisId="right" orientation="right" tick={axTick} domain={[0, 100]} unit="%" />
                      <Tooltip content={<Tip />} />
                      <Legend wrapperStyle={{ paddingTop: 52, fontSize: 12, color: '#6b7094' }} />
                      <Bar yAxisId="left" dataKey="Predictions" radius={[6,6,0,0]} barSize={22}>
                        {barData.map((_, i) => <Cell key={i} fill={P[i % P.length]} opacity={0.85} />)}
                      </Bar>
                      <Line
                        yAxisId="right" type="monotone" dataKey="Confidence"
                        stroke="#f59e0b" strokeWidth={2.5}
                        dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} unit="%"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Grid>

            {/* 3. Donut Pie — Distribution */}
            <Grid item xs={12} md={5}>
              <Card
                title="Group Distribution"
                subtitle="Share of total predictions per cancer type"
                icon={<DonutLargeRounded fontSize="small" />}
              >
                {pieData.length === 0 ? <Empty /> : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={pieData} cx="50%" cy="44%"
                        innerRadius={70} outerRadius={110}
                        paddingAngle={3} dataKey="value" strokeWidth={0}
                      >
                        {pieData.map((_, i) => <Cell key={i} fill={P[i % P.length]} />)}
                      </Pie>
                      <Legend formatter={(v) => (
                        <span style={{ color: '#6b7094', fontSize: 11 }}>
                          {v.replace(/ Cancer| Tumor/g, '')}
                        </span>
                      )} />
                      <Tooltip content={<Tip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Grid>

            {/* 4. Radar — Volume vs Confidence */}
            <Grid item xs={12} md={6}>
              <Card
                title="Volume vs Confidence Radar"
                subtitle="Normalised comparison: volume (%) &amp; confidence (%) per group"
                icon={<RadarRounded fontSize="small" />}
              >
                {radarData.length === 0 ? <Empty /> : (
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                      <PolarGrid stroke="rgba(124,106,245,0.15)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7094', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9b96c4', fontSize: 10 }} />
                      <Radar name="Volume"     dataKey="Volume"     stroke="#7c6af5" fill="#7c6af5" fillOpacity={0.25} strokeWidth={2} />
                      <Radar name="Confidence" dataKey="Confidence" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#6b7094' }} />
                      <Tooltip content={<Tip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Grid>

            {/* 5. RadialBar — Confidence Meter */}
            <Grid item xs={12} md={6}>
              <Card
                title="Confidence Meter per Group"
                subtitle="Radial bars showing average AI confidence per cancer type"
                icon={<DonutLargeRounded fontSize="small" />}
              >
                {radialData.length === 0 ? <Empty /> : (
                  <ResponsiveContainer width="100%" height={320}>
                    <RadialBarChart
                      innerRadius={20} outerRadius={140}
                      data={radialData} startAngle={180} endAngle={0}
                      cx="50%" cy="75%"
                    >
                      <RadialBar
                        minAngle={5} dataKey="Confidence"
                        background={{ fill: 'rgba(124,106,245,0.06)' }}
                        cornerRadius={6}
                        label={{ position: 'insideStart', fill: '#9b96c4', fontSize: 10 }}
                      />
                      <Legend
                        iconSize={10} layout="vertical"
                        verticalAlign="middle" align="right"
                        formatter={(v, entry) => (
                          <span style={{ color: '#6b7094', fontSize: 11 }}>
                            {entry?.payload?.name ?? v}
                          </span>
                        )}
                      />
                      <Tooltip content={<Tip />} formatter={(val) => [`${val}%`, 'Confidence']} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Grid>

            {/* 6. Horizontal Bar — Confidence Ranking */}
            <Grid item xs={12} md={7}>
              <Card
                title="Confidence Score Ranking"
                subtitle="Cancer groups ranked by avg model confidence (%)"
                icon={<BarChartRounded fontSize="small" />}
              >
                {barData.length === 0 ? <Empty /> : (
                  <ResponsiveContainer width="100%" height={Math.max(260, barData.length * 48)}>
                    <BarChart
                      data={[...barData].sort((a, b) => b.Confidence - a.Confidence)}
                      layout="vertical"
                      margin={{ top: 0, right: 30, left: 70, bottom: 0 }}
                    >
                      {cGrid}
                      <XAxis type="number" domain={[0, 100]} tick={axTick} unit="%" />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#6b7094', fontSize: 11 }} width={70} />
                      <Tooltip content={<Tip />} formatter={(v) => [`${v}%`, 'Avg Confidence']} />
                      <Bar dataKey="Confidence" radius={[0, 8, 8, 0]} barSize={18}>
                        {[...barData]
                          .sort((a, b) => b.Confidence - a.Confidence)
                          .map((_, i) => (
                            <Cell key={i} fill={P[i % P.length]} opacity={0.85} />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Grid>

            {/* 7. Scatter — Volume vs Confidence Bubble */}
            <Grid item xs={12} md={5}>
              <Card
                title="Volume vs Confidence Scatter"
                subtitle="Each bubble = a cancer group · size = relative volume"
                icon={<ShowChartRounded fontSize="small" />}
              >
                {scatterData.length === 0 ? <Empty /> : (
                  <ResponsiveContainer width="100%" height={Math.max(260, barData.length * 48)}>
                    <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: -10 }}>
                      {cGrid}
                      <XAxis
                        dataKey="x" name="Predictions" type="number" tick={axTick}
                        label={{ value: 'Predictions', position: 'insideBottomRight', offset: -10, fill: '#9b96c4', fontSize: 11 }}
                      />
                      <YAxis dataKey="y" name="Confidence" type="number" tick={axTick} domain={[50, 100]} unit="%" />
                      <ZAxis dataKey="z" range={[60, 400]} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3', stroke: 'rgba(124,106,245,0.3)' }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0]?.payload;
                          return (
                            <Box sx={{
                              background: 'rgba(255,255,255,0.98)',
                              border: '1px solid rgba(124,106,245,0.2)',
                              p: 1.5, borderRadius: 2,
                              boxShadow: '0 8px 24px rgba(124,106,245,0.15)',
                            }}>
                              <Typography variant="caption" sx={{ color: '#7c6af5', fontWeight: 700, display: 'block' }}>{d?.name}</Typography>
                              <Typography variant="caption" sx={{ color: '#1e1b3a', display: 'block' }}>Predictions: <strong>{d?.x}</strong></Typography>
                              <Typography variant="caption" sx={{ color: '#1e1b3a', display: 'block' }}>Confidence: <strong>{d?.y}%</strong></Typography>
                            </Box>
                          );
                        }}
                      />
                      <Scatter data={scatterData}>
                        {scatterData.map((_, i) => (
                          <Cell key={i} fill={P[i % P.length]} fillOpacity={0.8} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Grid>

          </Grid>
        </>
      )}
    </Box>
  );
}
