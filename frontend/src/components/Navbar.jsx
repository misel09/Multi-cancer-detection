import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Menu, MenuItem, Avatar, Divider, Chip
} from '@mui/material';
import {
  BiotechRounded, DashboardRounded, HistoryRounded,
  AnalyticsRounded, CloudUploadRounded, LogoutRounded,
  MenuRounded, AccountCircleRounded
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardRounded fontSize="small" /> },
  { label: 'Analyze', path: '/analyze', icon: <CloudUploadRounded fontSize="small" /> },
  { label: 'History', path: '/history', icon: <HistoryRounded fontSize="small" /> },
  { label: 'Analytics', path: '/analytics', icon: <AnalyticsRounded fontSize="small" /> },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  if (!user) return null;

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, rgba(10,10,30,0.98) 0%, rgba(15,15,45,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo */}
        <Box
          onClick={() => navigate('/dashboard')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mr: 4 }}
        >
          <BiotechRounded sx={{ color: '#818cf8', fontSize: 28 }} />
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(90deg, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            CancerAI
          </Typography>
        </Box>

        {/* Nav Items */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: 1 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: active ? '#818cf8' : 'rgba(255,255,255,0.6)',
                  fontWeight: active ? 700 : 400,
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  borderRadius: 2,
                  px: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'rgba(99,102,241,0.1)',
                    color: '#818cf8',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={user?.name?.split(' ')[0] || 'User'}
            avatar={<AccountCircleRounded />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              color: 'white',
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.3)',
              cursor: 'pointer',
              '& .MuiChip-avatar': { color: '#818cf8' },
            }}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                background: 'rgba(15,15,45,0.98)',
                border: '1px solid rgba(99,102,241,0.2)',
                backdropFilter: 'blur(20px)',
                color: 'white',
                mt: 1,
              },
            }}
          >
            <MenuItem disabled sx={{ opacity: 0.6, fontSize: 12 }}>
              {user?.email}
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <MenuItem
              onClick={handleLogout}
              sx={{ gap: 1, '&:hover': { color: '#f87171' } }}
            >
              <LogoutRounded fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
