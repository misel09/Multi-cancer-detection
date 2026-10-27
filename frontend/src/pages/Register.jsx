import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress,
  Alert, Divider, InputAdornment, IconButton,
} from '@mui/material';
import {
  ScienceRounded, EmailRounded, LockRounded, PersonRounded,
  VisibilityRounded, VisibilityOffRounded,
  AdminPanelSettingsRounded, PersonOutlineRounded,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

const ROLES = [
  {
    value: 'user',
    label: 'User',
    desc: 'Standard access — upload & view results',
    icon: <PersonOutlineRounded sx={{ fontSize: 22 }} />,
    color: '#7c6af5',
    gradient: 'linear-gradient(135deg, rgba(124,106,245,0.12), rgba(167,139,250,0.06))',
    border: 'rgba(124,106,245,0.35)',
  },
  {
    value: 'admin',
    label: 'Admin',
    desc: 'Full access — manage users & system',
    icon: <AdminPanelSettingsRounded sx={{ fontSize: 22 }} />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,146,60,0.06))',
    border: 'rgba(245,158,11,0.4)',
  },
];

export default function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [role, setRole] = useState('user');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await registerApi(form.name, form.email, form.password, role);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f4f0ff 0%, #e8e4ff 50%, #f0f2fa 100%)',
      p: 2, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <Box sx={{ position: 'fixed', top: -120, right: -120, width: 450, height: 450, borderRadius: '50%', background: 'rgba(167,139,250,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'fixed', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(124,106,245,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <Paper elevation={2} sx={{
        width: '100%', maxWidth: 440, p: 4,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(124,106,245,0.15)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(124,106,245,0.15)',
      }}>

        {/* ── Logo + Title ── */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '16px',
            background: 'linear-gradient(135deg, #a78bfa, #7c6af5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px rgba(167,139,250,0.4)',
          }}>
            <ScienceRounded sx={{ fontSize: 34, color: 'white' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{
            background: 'linear-gradient(90deg, #a78bfa, #7c6af5)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ color: '#9b96c4', mt: 0.5 }}>
            Join the CancerAI Detection System
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>

          {/* ── Role selector ── */}
          <Typography variant="caption" sx={{ color: '#9b96c4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 1 }}>
            Account Type
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
            {ROLES.map((r) => {
              const selected = role === r.value;
              return (
                <Box
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  sx={{
                    p: 1.5, borderRadius: 2.5, cursor: 'pointer',
                    border: `2px solid ${selected ? r.border : 'rgba(124,106,245,0.12)'}`,
                    background: selected ? r.gradient : 'transparent',
                    transition: 'all 0.18s ease',
                    textAlign: 'center',
                    '&:hover': {
                      border: `2px solid ${r.border}`,
                      background: r.gradient,
                    },
                  }}
                >
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2,
                    background: selected ? `${r.color}20` : 'rgba(124,106,245,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: selected ? r.color : '#9b96c4',
                    margin: '0 auto 8px',
                    transition: 'all 0.18s ease',
                  }}>
                    {r.icon}
                  </Box>
                  <Typography fontWeight={selected ? 800 : 600} fontSize={13}
                    sx={{ color: selected ? r.color : '#6b7094', lineHeight: 1.1 }}>
                    {r.label}
                  </Typography>
                  <Typography fontSize={10.5} sx={{ color: '#9b96c4', mt: 0.4, lineHeight: 1.3 }}>
                    {r.desc}
                  </Typography>
                  {selected && (
                    <Box sx={{
                      mt: 0.8, width: 6, height: 6, borderRadius: '50%',
                      background: r.color, boxShadow: `0 0 8px ${r.color}80`,
                      mx: 'auto',
                    }} />
                  )}
                </Box>
              );
            })}
          </Box>

          {/* ── Fields ── */}
          <TextField
            id="reg-name" fullWidth label="Full Name"
            value={form.name} onChange={set('name')} required sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonRounded sx={{ color: '#7c6af5', fontSize: 20 }} /></InputAdornment>,
            }}
          />
          <TextField
            id="reg-email" fullWidth label="Email Address"
            type="email" value={form.email} onChange={set('email')} required sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailRounded sx={{ color: '#7c6af5', fontSize: 20 }} /></InputAdornment>,
            }}
          />
          <TextField
            id="reg-password" fullWidth label="Password (min 6 chars)"
            type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} required sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockRounded sx={{ color: '#7c6af5', fontSize: 20 }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" sx={{ color: '#9b96c4' }}>
                    {showPwd ? <VisibilityOffRounded /> : <VisibilityRounded />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            id="reg-submit" type="submit" fullWidth variant="contained"
            disabled={loading}
            sx={{
              py: 1.5, fontWeight: 700, fontSize: 15, borderRadius: 2,
              background: role === 'admin'
                ? 'linear-gradient(135deg, #f59e0b, #fb923c)'
                : 'linear-gradient(135deg, #7c6af5, #a78bfa)',
              boxShadow: role === 'admin'
                ? '0 4px 14px rgba(245,158,11,0.35)'
                : '0 4px 14px rgba(124,106,245,0.35)',
              '&:hover': {
                background: role === 'admin'
                  ? 'linear-gradient(135deg, #d97706, #ea7a2a)'
                  : 'linear-gradient(135deg, #6b57e8, #9270f5)',
              },
            }}
          >
            {loading
              ? <CircularProgress size={22} sx={{ color: 'white' }} />
              : `Create ${role === 'admin' ? 'Admin' : 'User'} Account`
            }
          </Button>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" sx={{ color: '#c4bfe8' }}>or</Typography>
        </Divider>

        <Typography variant="body2" align="center" sx={{ color: '#9b96c4' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#7c6af5', textDecoration: 'none', fontWeight: 700 }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
