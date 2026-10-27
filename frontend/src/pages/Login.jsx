import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress,
  Alert, Divider, InputAdornment, IconButton
} from '@mui/material';
import {
  ScienceRounded, EmailRounded, LockRounded,
  VisibilityRounded, VisibilityOffRounded
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi, getMe } from '../services/auth';
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
    setLoading(true); setError('');
    try {
      const res = await loginApi(email, password);
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      const meRes = await getMe();
      signIn(token, meRes.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f2fa 0%, #e8e4ff 50%, #f4f0ff 100%)',
      p: 2, position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <Box sx={{ position: 'fixed', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(124,106,245,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'fixed', bottom: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'rgba(167,139,250,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <Paper elevation={2} sx={{
        width: '100%', maxWidth: 420, p: 4,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(124,106,245,0.15)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(124,106,245,0.15)',
      }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c6af5, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px rgba(124,106,245,0.4)',
          }}>
            <ScienceRounded sx={{ fontSize: 34, color: 'white' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{
            background: 'linear-gradient(90deg, #7c6af5, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: '#9b96c4', mt: 0.5 }}>
            Sign in to CancerAI Detection System
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            id="login-email" fullWidth label="Email Address"
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            required sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailRounded sx={{ color: '#7c6af5', fontSize: 20 }} /></InputAdornment>,
            }}
          />
          <TextField
            id="login-password" fullWidth label="Password"
            type={showPwd ? 'text' : 'password'} value={password}
            onChange={(e) => setPassword(e.target.value)}
            required sx={{ mb: 3 }}
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
            id="login-submit" type="submit" fullWidth variant="contained"
            disabled={loading}
            sx={{ py: 1.5, fontWeight: 700, fontSize: 15, borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Sign In'}
          </Button>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" sx={{ color: '#c4bfe8' }}>or</Typography>
        </Divider>

        <Typography variant="body2" align="center" sx={{ color: '#9b96c4' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#7c6af5', textDecoration: 'none', fontWeight: 700 }}>
            Create one
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
