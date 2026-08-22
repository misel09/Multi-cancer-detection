import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress,
  Alert, Divider, InputAdornment, IconButton
} from '@mui/material';
import {
  BiotechRounded, EmailRounded, LockRounded, PersonRounded,
  VisibilityRounded, VisibilityOffRounded
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../services/auth';
import { getMe } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await registerApi(form.name, form.email, form.password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 80% 50%, rgba(192,132,252,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.1) 0%, transparent 60%), #08080f',
        p: 2,
      }}
    >
      <Box sx={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(192,132,252,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          background: 'rgba(15,15,45,0.85)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 4,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 60, height: 60, borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(192,132,252,0.3), rgba(99,102,241,0.3))',
            border: '1px solid rgba(192,132,252,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <BiotechRounded sx={{ fontSize: 32, color: '#c084fc' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{
            background: 'linear-gradient(90deg, #c084fc, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
            Join the CancerAI Detection System
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            id="reg-name"
            fullWidth
            label="Full Name"
            value={form.name}
            onChange={set('name')}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonRounded sx={{ color: '#c084fc', fontSize: 20 }} /></InputAdornment>,
            }}
          />
          <TextField
            id="reg-email"
            fullWidth
            label="Email Address"
            type="email"
            value={form.email}
            onChange={set('email')}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailRounded sx={{ color: '#c084fc', fontSize: 20 }} /></InputAdornment>,
            }}
          />
          <TextField
            id="reg-password"
            fullWidth
            label="Password (min 6 chars)"
            type={showPwd ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockRounded sx={{ color: '#c084fc', fontSize: 20 }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    {showPwd ? <VisibilityOffRounded /> : <VisibilityRounded />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            id="reg-submit"
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' },
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Create Account'}
          </Button>
        </form>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>or</Typography>
        </Divider>

        <Typography variant="body2" align="center" sx={{ color: 'rgba(255,255,255,0.45)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 700 }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
