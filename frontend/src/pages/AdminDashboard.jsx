import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, CircularProgress,
  Avatar, Chip, IconButton, Tooltip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Switch,
  Menu, MenuItem, Divider, Alert, Skeleton,
} from '@mui/material';
import {
  PeopleRounded, AssessmentRounded, HourglassEmptyRounded,
  TrendingUpRounded, MoreVertRounded, AdminPanelSettingsRounded,
  PersonRounded, CheckCircleRounded, BlockRounded,
} from '@mui/icons-material';
import { getAdminStats, getAdminUsers, updateUserRole, updateUserActive } from '../services/admin';

// ── Helpers ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#7c6af5','#a78bfa','#f472b6','#fb923c','#22c55e','#3b82f6','#f59e0b','#2dd4bf'];
const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const KPI = ({ label, value, sub, color = '#7c6af5', icon }) => (
  <Paper elevation={1} sx={{
    p: 2.5, borderRadius: 3,
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

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = async () => {
    try {
      const [sRes, uRes] = await Promise.all([getAdminStats(), getAdminUsers()]);
      setStats(sRes.data);
      setUsers(uRes.data);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openMenu = (e, user) => { setMenuAnchor(e.currentTarget); setSelectedUser(user); };
  const closeMenu = () => { setMenuAnchor(null); setSelectedUser(null); };

  const handleRoleToggle = async () => {
    const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';
    closeMenu();
    try {
      const res = await updateUserRole(selectedUser.id, newRole);
      setUsers(prev => prev.map(u => u.id === res.data.id ? res.data : u));
    } catch (e) {
      setError('Failed to update role.');
    }
  };

  const handleActiveToggle = async (user) => {
    try {
      const res = await updateUserActive(user.id, !user.is_active);
      setUsers(prev => prev.map(u => u.id === res.data.id ? res.data : u));
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to update status.');
    }
  };

  const kpis = stats ? [
    { label: 'Total Users',      value: stats.total_users,      sub: `${stats.active_users} active`,              color: '#7c6af5', icon: <PeopleRounded fontSize="small"/> },
    { label: 'Total Scans',      value: stats.total_predictions, sub: 'All time',                                 color: '#a78bfa', icon: <AssessmentRounded fontSize="small"/> },
    { label: 'Pending Reviews',  value: stats.pending_reviews,  sub: 'Awaiting doctor sign-off',                  color: '#f59e0b', icon: <HourglassEmptyRounded fontSize="small"/> },
    { label: 'Avg Confidence',   value: `${Math.round(stats.average_confidence * 100)}%`, sub: 'Model certainty', color: '#22c55e', icon: <TrendingUpRounded fontSize="small"/> },
  ] : [];

  return (
    <Box sx={{ minHeight: '100vh', pt: 4, pb: 8, px: { xs: 2, sm: 3, md: 5 }, boxSizing: 'border-box' }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid rgba(124,106,245,0.12)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            background: 'linear-gradient(135deg, #7c6af5, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124,106,245,0.35)',
          }}>
            <AdminPanelSettingsRounded sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: '#1e1b3a', fontWeight: 800, lineHeight: 1.1 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#9b96c4' }}>
              Manage users, roles, and monitor system health
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => <Grid item xs={12} sm={6} lg={3} key={i}><Skeleton variant="rounded" height={100} sx={{ borderRadius: 3, bgcolor: 'rgba(124,106,245,0.07)' }} /></Grid>)}
          <Grid item xs={12}><Skeleton variant="rounded" height={400} sx={{ borderRadius: 3, bgcolor: 'rgba(124,106,245,0.07)' }} /></Grid>
        </Grid>
      ) : (
        <>
          {/* ── KPI Row ── */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {kpis.map(k => (
              <Grid item xs={12} sm={6} lg={3} key={k.label}>
                <KPI {...k} />
              </Grid>
            ))}
          </Grid>

          {/* ── User Management Table ── */}
          <Paper elevation={1} sx={{
            borderRadius: 3, overflow: 'hidden',
            border: '1px solid rgba(124,106,245,0.1)',
            boxShadow: '0 4px 20px rgba(124,106,245,0.07)',
          }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(124,106,245,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#1e1b3a' }}>User Management</Typography>
                <Typography variant="caption" sx={{ color: '#9b96c4' }}>{users.length} registered account{users.length !== 1 ? 's' : ''}</Typography>
              </Box>
              <Chip
                label={`${users.filter(u => u.role === 'admin').length} admin${users.filter(u => u.role === 'admin').length !== 1 ? 's' : ''}`}
                size="small"
                sx={{ background: 'rgba(124,106,245,0.1)', color: '#7c6af5', border: '1px solid rgba(124,106,245,0.2)', fontWeight: 700 }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(124,106,245,0.03)' }}>
                    {['User', 'Email', 'Role', 'Scans', 'Joined', 'Active', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ color: '#9b96c4', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id} hover sx={{ '&:hover': { background: 'rgba(124,106,245,0.025)' }, transition: 'background 0.15s' }}>
                      {/* User */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{
                            width: 36, height: 36, fontSize: 14, fontWeight: 800,
                            background: `linear-gradient(135deg, ${avatarColor(u.id)}, ${avatarColor(u.id + 2)})`,
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={700} fontSize={13} sx={{ color: '#1e1b3a' }}>{u.name}</Typography>
                            {u.specialty && <Typography fontSize={11} sx={{ color: '#9b96c4' }}>{u.specialty}</Typography>}
                          </Box>
                        </Box>
                      </TableCell>
                      {/* Email */}
                      <TableCell>
                        <Typography fontSize={12} sx={{ color: '#6b7094' }}>{u.email}</Typography>
                      </TableCell>
                      {/* Role */}
                      <TableCell>
                        <Chip
                          label={u.role.toUpperCase()}
                          size="small"
                          icon={u.role === 'admin' ? <AdminPanelSettingsRounded sx={{ fontSize: '14px !important' }} /> : <PersonRounded sx={{ fontSize: '14px !important' }} />}
                          sx={{
                            fontWeight: 700, fontSize: 10,
                            ...(u.role === 'admin'
                              ? { color: '#7c6af5', background: 'rgba(124,106,245,0.1)', border: '1px solid rgba(124,106,245,0.25)', '& .MuiChip-icon': { color: '#7c6af5' } }
                              : { color: '#6b7094', background: 'rgba(107,112,148,0.08)', border: '1px solid rgba(107,112,148,0.2)', '& .MuiChip-icon': { color: '#6b7094' } }
                            ),
                          }}
                        />
                      </TableCell>
                      {/* Scan count */}
                      <TableCell>
                        <Typography fontSize={13} fontWeight={700} sx={{ color: '#1e1b3a' }}>{u.prediction_count}</Typography>
                      </TableCell>
                      {/* Joined */}
                      <TableCell>
                        <Typography fontSize={12} sx={{ color: '#9b96c4' }}>
                          {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      {/* Active toggle */}
                      <TableCell>
                        <Tooltip title={u.is_active ? 'Deactivate user' : 'Activate user'}>
                          <Switch
                            checked={u.is_active}
                            onChange={() => handleActiveToggle(u)}
                            size="small"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#7c6af5' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#7c6af5' },
                            }}
                          />
                        </Tooltip>
                        <Chip
                          label={u.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          icon={u.is_active ? <CheckCircleRounded sx={{ fontSize: '12px !important' }} /> : <BlockRounded sx={{ fontSize: '12px !important' }} />}
                          sx={{
                            ml: 0.5, fontWeight: 700, fontSize: 10,
                            ...(u.is_active
                              ? { color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', '& .MuiChip-icon': { color: '#22c55e' } }
                              : { color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', '& .MuiChip-icon': { color: '#ef4444' } }
                            ),
                          }}
                        />
                      </TableCell>
                      {/* Actions */}
                      <TableCell>
                        <IconButton size="small" onClick={(e) => openMenu(e, u)} sx={{ color: '#9b96c4', '&:hover': { color: '#7c6af5' } }}>
                          <MoreVertRounded fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* ── Role action menu ── */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
            PaperProps={{ sx: { borderRadius: 2, border: '1px solid rgba(124,106,245,0.15)', boxShadow: '0 8px 24px rgba(124,106,245,0.15)', minWidth: 180 } }}
          >
            <MenuItem onClick={handleRoleToggle} sx={{ fontSize: 13, gap: 1, color: '#1e1b3a' }}>
              <AdminPanelSettingsRounded fontSize="small" sx={{ color: '#7c6af5' }} />
              {selectedUser?.role === 'admin' ? 'Remove Admin Role' : 'Make Admin'}
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => { handleActiveToggle(selectedUser); closeMenu(); }} sx={{ fontSize: 13, gap: 1, color: selectedUser?.is_active ? '#ef4444' : '#22c55e' }}>
              {selectedUser?.is_active ? <BlockRounded fontSize="small" /> : <CheckCircleRounded fontSize="small" />}
              {selectedUser?.is_active ? 'Deactivate Account' : 'Activate Account'}
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
}
