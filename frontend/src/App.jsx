import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ImageAnalysis from './pages/ImageAnalysis';
import PredictionResult from './pages/PredictionResult';
import History from './pages/History';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/AdminDashboard';
import ProfileSettings from './pages/ProfileSettings';
import Notifications from './pages/Notifications';

// ── Light Violet / Lavender theme (matches reference UI) ─────────────────────
const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: '#7c6af5', light: '#a78bfa', dark: '#5b47e0', contrastText: '#fff' },
    secondary:  { main: '#a78bfa', contrastText: '#fff' },
    success:    { main: '#22c55e' },
    error:      { main: '#ef4444' },
    warning:    { main: '#f59e0b' },
    info:       { main: '#3b82f6' },
    background: { default: '#f0f2fa', paper: '#ffffff' },
    text:       { primary: '#1e1b3a', secondary: '#6b7094' },
    divider:    'rgba(124,106,245,0.1)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  shadows: [
    'none',
    '0 2px 8px rgba(124,106,245,0.07)',
    '0 4px 16px rgba(124,106,245,0.09)',
    '0 6px 20px rgba(124,106,245,0.11)',
    '0 8px 24px rgba(124,106,245,0.13)',
    '0 10px 30px rgba(124,106,245,0.14)',
    ...Array(19).fill('0 12px 40px rgba(124,106,245,0.16)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { background: '#f0f2fa' } },
    },
    MuiPaper: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(124,106,245,0.1)',
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(124,106,245,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(135deg, #7c6af5, #a78bfa)',
          boxShadow: '0 4px 14px rgba(124,106,245,0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6b57e8, #9270f5)',
            boxShadow: '0 6px 20px rgba(124,106,245,0.45)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(124,106,245,0.4)',
          '&:hover': { background: 'rgba(124,106,245,0.06)', borderColor: '#7c6af5' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: '#f8f7ff',
            borderRadius: 10,
            '& fieldset':             { borderColor: 'rgba(124,106,245,0.2)' },
            '&:hover fieldset':       { borderColor: 'rgba(124,106,245,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#7c6af5' },
          },
          '& .MuiInputLabel-root':             { color: '#9b96c4' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#7c6af5' },
          '& .MuiInputBase-input':             { color: '#1e1b3a' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 8 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: 'rgba(124,106,245,0.08)' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8, background: 'rgba(124,106,245,0.1)' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(124,106,245,0.1)' },
      },
    },
  },
});

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"         element={<Login />} />
      <Route path="/register"      element={<Register />} />
      <Route path="/dashboard"     element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/analyze"       element={<ProtectedLayout><ImageAnalysis /></ProtectedLayout>} />
      <Route path="/result/:id"    element={<ProtectedLayout><PredictionResult /></ProtectedLayout>} />
      <Route path="/history"       element={<ProtectedLayout><History /></ProtectedLayout>} />
      <Route path="/analytics"     element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
      <Route path="/profile"       element={<ProtectedLayout><ProfileSettings /></ProtectedLayout>} />
      <Route path="/notifications" element={<ProtectedLayout><Notifications /></ProtectedLayout>} />
      <Route path="/admin"         element={<ProtectedLayout><AdminRoute><AdminDashboard /></AdminRoute></ProtectedLayout>} />
      <Route path="*"              element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
