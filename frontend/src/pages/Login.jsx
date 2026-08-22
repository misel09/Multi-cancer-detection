import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress,
  Alert, Divider, InputAdornment, IconButton
} from '@mui/material';
import {
  BiotechRounded, EmailRounded, LockRounded,
  VisibilityRounded, VisibilityOffRounded
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../services/auth';
import { getMe } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginApi(email, password);
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      const meRes = await getMe();
      signIn(token, meRes.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
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
        background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(192,132,252,0.1) 0%, transparent 60%), #08080f',
        p: 2,
      }}
    >
      {/* Decorative blobs */}
      <Box sx={{ position: 'fixed', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'fixed', bottom: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(192,132,252,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

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
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 60, height: 60, borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(192,132,252,0.3))',
            border: '1px solid rgba(99,102,241,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <BiotechRounded sx={{ fontSize: 32, color: '#818cf8' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{
            background: 'linear-gradient(90deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
            Sign in to CancerAI Detection System
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            id="login-email"
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailRounded sx={{ color: '#818cf8', fontSize: 20 }} /></InputAdornment>,
            }}
          />
          <TextField
            id="login-password"
            fullWidth
            label="Password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockRounded sx={{ color: '#818cf8', fontSize: 20 }} /></InputAdornment>,
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
            id="login-submit"
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Sign In'}
          </Button>
        </form>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>or</Typography>
        </Divider>

        <Typography variant="body2" align="center" sx={{ color: 'rgba(255,255,255,0.45)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 700 }}>
            Create one
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
