import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, Button,
  Avatar, Divider, Alert, CircularProgress, Chip, Snackbar,
} from '@mui/material';
import {
  PersonRounded, LockRounded, SaveRounded,
  AdminPanelSettingsRounded, CalendarTodayRounded,
  LocalPhoneRounded, MedicalServicesRounded,
} from '@mui/icons-material';
import { getProfile, updateProfile, changePassword } from '../services/profile';
import { useAuth } from '../hooks/useAuth';

const AVATAR_COLORS = ['#7c6af5','#a78bfa','#f472b6','#fb923c','#22c55e','#3b82f6','#f59e0b','#2dd4bf'];
const pickColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

const SectionCard = ({ title, icon, children }) => (
  <Paper elevation={1} sx={{
    p: 3, borderRadius: 3,
    border: '1px solid rgba(124,106,245,0.1)',
    boxShadow: '0 4px 20px rgba(124,106,245,0.07)',
    mb: 3,
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: 2,
        background: 'rgba(124,106,245,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c6af5',
      }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ color: '#1e1b3a' }}>{title}</Typography>
    </Box>
    <Divider sx={{ mb: 2.5 }} />
    {children}
  </Paper>
);

export default function ProfileSettings() {
  const { user: authUser, signIn } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  // Profile form
  const [name,      setName]      = useState('');
  const [phone,     setPhone]     = useState('');
  const [specialty, setSpecialty] = useState('');

  // Password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError,   setPwdError]   = useState('');

  // Toast
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });
  const showToast = (msg, severity = 'success') => setToast({ open: true, msg, severity });

  useEffect(() => {
    getProfile()
      .then(res => {
        setProfile(res.data);
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
        setSpecialty(res.data.specialty || '');
      })
      .catch(() => showToast('Failed to load profile.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({ name, phone, specialty });
      setProfile(res.data);
      // Update auth context name so sidebar greeting updates
      if (authUser) signIn(localStorage.getItem('token'), { ...authUser, name: res.data.name });
      showToast('Profile updated successfully!');
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdError('');
    if (newPwd !== confirmPwd) { setPwdError('New passwords do not match.'); return; }
    if (newPwd.length < 6)     { setPwdError('Password must be at least 6 characters.'); return; }
    setPwdSaving(true);
    try {
      await changePassword({ current_password: currentPwd, new_password: newPwd });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      showToast('Password changed successfully!');
    } catch (e) {
      setPwdError(e?.response?.data?.detail || 'Failed to change password.');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: '#7c6af5' }} />
    </Box>
  );

  const avatarBg = `linear-gradient(135deg, ${pickColor(profile?.id)}, ${pickColor((profile?.id || 0) + 2)})`;

  return (
    <Box sx={{ minHeight: '100vh', pt: 4, pb: 8, px: { xs: 2, sm: 3, md: 5 }, boxSizing: 'border-box' }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid rgba(124,106,245,0.12)' }}>
        <Typography variant="h4" sx={{ color: '#1e1b3a', fontWeight: 800 }}>Profile Settings</Typography>
        <Typography variant="body2" sx={{ color: '#9b96c4', mt: 0.5 }}>
          Manage your account details and security settings
        </Typography>
      </Box>

      <Grid container spacing={3}>

        {/* ── Left column: Avatar card ── */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{
            p: 3, borderRadius: 3, textAlign: 'center',
            border: '1px solid rgba(124,106,245,0.1)',
            boxShadow: '0 4px 20px rgba(124,106,245,0.07)',
            mb: 3,
          }}>
            <Avatar sx={{
              width: 88, height: 88, mx: 'auto', mb: 2,
              background: avatarBg, fontSize: 34, fontWeight: 800,
              boxShadow: '0 8px 24px rgba(124,106,245,0.3)',
            }}>
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#1e1b3a' }}>{profile?.name}</Typography>
            <Typography fontSize={13} sx={{ color: '#9b96c4', mb: 1.5 }}>{profile?.email}</Typography>
            <Chip
              label={profile?.role?.toUpperCase()}
              size="small"
              icon={profile?.role === 'admin'
                ? <AdminPanelSettingsRounded sx={{ fontSize: '14px !important' }} />
                : <PersonRounded sx={{ fontSize: '14px !important' }} />
              }
              sx={{
                fontWeight: 700, fontSize: 10, mb: 2,
                ...(profile?.role === 'admin'
                  ? { color: '#7c6af5', background: 'rgba(124,106,245,0.1)', border: '1px solid rgba(124,106,245,0.25)', '& .MuiChip-icon': { color: '#7c6af5' } }
                  : { color: '#6b7094', background: 'rgba(107,112,148,0.08)', border: '1px solid rgba(107,112,148,0.2)', '& .MuiChip-icon': { color: '#6b7094' } }
                ),
              }}
            />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { icon: <LocalPhoneRounded fontSize="small" />, label: profile?.phone || 'No phone added' },
                { icon: <MedicalServicesRounded fontSize="small" />, label: profile?.specialty || 'No specialty added' },
                { icon: <CalendarTodayRounded fontSize="small" />, label: `Joined ${new Date(profile?.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}` },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ color: '#7c6af5', display: 'flex', flexShrink: 0 }}>{item.icon}</Box>
                  <Typography fontSize={12} sx={{ color: '#6b7094' }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* ── Right column: Forms ── */}
        <Grid item xs={12} md={8}>

          {/* Profile info */}
          <SectionCard title="Personal Information" icon={<PersonRounded fontSize="small" />}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name" fullWidth value={name}
                  onChange={e => setName(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email Address" fullWidth value={profile?.email || ''}
                  disabled size="small"
                  helperText="Email cannot be changed."
                  sx={{ '& .MuiInputBase-input.Mui-disabled': { color: '#9b96c4', WebkitTextFillColor: '#9b96c4' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number" fullWidth value={phone}
                  onChange={e => setPhone(e.target.value)}
                  size="small" placeholder="+91 98765 43210"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Specialty / Department" fullWidth value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  size="small" placeholder="e.g. Oncology, Radiology"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRounded />}
                  onClick={handleSaveProfile} disabled={saving || !name.trim()}
                  sx={{ borderRadius: 2 }}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </SectionCard>

          {/* Change password */}
          <SectionCard title="Change Password" icon={<LockRounded fontSize="small" />}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Current Password" type="password" fullWidth
                  value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="New Password" type="password" fullWidth
                  value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirm New Password" type="password" fullWidth
                  value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                  size="small"
                  error={confirmPwd.length > 0 && newPwd !== confirmPwd}
                />
              </Grid>
              {pwdError && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ borderRadius: 2, py: 0 }}>{pwdError}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  variant="outlined" startIcon={pwdSaving ? <CircularProgress size={16} /> : <LockRounded />}
                  onClick={handleChangePassword} disabled={pwdSaving || !currentPwd || !newPwd || !confirmPwd}
                  sx={{ borderRadius: 2, borderColor: 'rgba(124,106,245,0.4)', color: '#7c6af5' }}
                >
                  {pwdSaving ? 'Changing…' : 'Change Password'}
                </Button>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Toast */}
      <Snackbar
        open={toast.open} autoHideDuration={4000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} sx={{ borderRadius: 2 }} onClose={() => setToast(t => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
