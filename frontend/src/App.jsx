import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ImageAnalysis from './pages/ImageAnalysis';
import PredictionResult from './pages/PredictionResult';
import History from './pages/History';
import Analytics from './pages/Analytics';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    secondary: { main: '#c084fc' },
    background: { default: '#08080f', paper: '#0f0f2d' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            '& fieldset': { borderColor: 'rgba(99,102,241,0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#6366f1' },
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/analyze" element={<ProtectedRoute><ImageAnalysis /></ProtectedRoute>} />
      <Route path="/result/:id" element={<ProtectedRoute><PredictionResult /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
