import { useState, useEffect } from 'react';
import { Box, Typography, Tooltip, Avatar, Divider, IconButton, Badge } from '@mui/material';
import {
  DashboardRounded, HistoryRounded, AnalyticsRounded,
  CloudUploadRounded, LogoutRounded, ChevronLeftRounded,
  ChevronRightRounded, ScienceRounded, AdminPanelSettingsRounded,
  PersonRounded, NotificationsRounded,
  SmartToyRounded,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const EXPANDED  = 240;
const COLLAPSED = 72;
const STORAGE_KEY = 'cancerAI_notifications';

const getUnread = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;
    return JSON.parse(stored).filter(n => !n.read).length;
  } catch { return 0; }
};

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(true);
  const [unread, setUnread] = useState(getUnread());

  // Refresh unread count when navigating (notifications page marks them read)
  useEffect(() => {
    setUnread(getUnread());
  }, [location.pathname]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: next } }));
  };

  if (!user) return null;

  const width = open ? EXPANDED : COLLAPSED;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard',     icon: <DashboardRounded /> },
    { label: 'Analyze',   path: '/analyze',        icon: <CloudUploadRounded /> },
    { label: 'History',   path: '/history',        icon: <HistoryRounded /> },
    { label: 'Analytics', path: '/analytics',      icon: <AnalyticsRounded /> },
    { label: 'Notifications', path: '/notifications', icon: (
        <Badge badgeContent={unread} color="error" max={9}
          sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 16, height: 16 } }}>
          <NotificationsRounded />
        </Badge>
      )
    },
    { label: 'Chatboard', path: '/chat', icon: <SmartToyRounded /> },
    { label: 'Profile',   path: '/profile',        icon: <PersonRounded /> },
    ...(user.role === 'admin'
      ? [{ label: 'Admin', path: '/admin', icon: <AdminPanelSettingsRounded /> }]
      : []),
  ];

  return (
    <Box
      sx={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh', width,
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        background: '#ffffff',
        borderRight: '1px solid rgba(124,106,245,0.1)',
        display: 'flex', flexDirection: 'column',
        zIndex: 1200, overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(124,106,245,0.07)',
      }}
    >
      {/* ── Logo ── */}
      <Box
        onClick={() => navigate('/dashboard')}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2, py: 2.5, minHeight: 64,
          cursor: 'pointer', overflow: 'hidden',
        }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #7c6af5, #a78bfa)',
          borderRadius: '10px', p: 0.8, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(124,106,245,0.4)',
        }}>
          <ScienceRounded sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        {open && (
          <Typography fontWeight={800} fontSize={17} sx={{
            background: 'linear-gradient(90deg, #7c6af5, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
          }}>
            CancerAI
          </Typography>
        )}
      </Box>

      {/* ── Collapse toggle ── */}
      <Box sx={{ px: open ? 1.5 : 1, mb: 1 }}>
        <IconButton
          onClick={handleToggle} size="small"
          sx={{
            color: '#9b96c4', width: '100%', borderRadius: 2,
            justifyContent: open ? 'flex-end' : 'center',
            py: 0.5, bgcolor: '#f8f7ff',
            '&:hover': { bgcolor: 'rgba(124,106,245,0.08)', color: '#7c6af5' },
          }}
        >
          {open ? <ChevronLeftRounded fontSize="small" /> : <ChevronRightRounded fontSize="small" />}
        </IconButton>
      </Box>

      <Divider sx={{ mx: 1.5, mb: 1 }} />

      {/* ── Nav items ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, px: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const isAdmin = item.path === '/admin';
          return (
            <Tooltip key={item.path} title={!open ? item.label : ''} placement="right" arrow>
              <Box
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex', alignItems: 'center',
                  gap: 1.5, px: 1.5, py: 1.2,
                  borderRadius: 2.5, cursor: 'pointer', overflow: 'hidden',
                  transition: 'all 0.18s ease',
                  background: active
                    ? isAdmin
                      ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,146,60,0.08))'
                      : 'linear-gradient(135deg, rgba(124,106,245,0.12), rgba(167,139,250,0.08))'
                    : 'transparent',
                  border: active
                    ? isAdmin ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(124,106,245,0.2)'
                    : '1px solid transparent',
                  color: active
                    ? isAdmin ? '#f59e0b' : '#7c6af5'
                    : '#6b7094',
                  '&:hover': {
                    background: isAdmin ? 'rgba(245,158,11,0.07)' : 'rgba(124,106,245,0.07)',
                    color: isAdmin ? '#f59e0b' : '#7c6af5',
                    transform: 'translateX(2px)',
                  },
                  mt: isAdmin ? 0.5 : 0,
                }}
              >
                <Box sx={{ fontSize: 21, flexShrink: 0, display: 'flex' }}>{item.icon}</Box>
                {open && (
                  <Typography fontWeight={active ? 700 : 500} fontSize={14} sx={{ whiteSpace: 'nowrap' }}>
                    {item.label}
                  </Typography>
                )}
                {active && open && (
                  <Box sx={{
                    ml: 'auto', width: 6, height: 6,
                    borderRadius: '50%',
                    background: isAdmin ? '#f59e0b' : '#7c6af5',
                    boxShadow: isAdmin ? '0 0 8px rgba(245,158,11,0.6)' : '0 0 8px rgba(124,106,245,0.6)',
                    flexShrink: 0,
                  }} />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Divider sx={{ mx: 1.5, mt: 1 }} />

      {/* ── User + Logout ── */}
      <Box sx={{ px: 1, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box
          onClick={() => navigate('/profile')}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 1.5, py: 1, borderRadius: 2.5, overflow: 'hidden',
            bgcolor: '#f8f7ff', cursor: 'pointer',
            transition: 'all 0.18s ease',
            '&:hover': { bgcolor: 'rgba(124,106,245,0.07)' },
          }}
        >
          <Avatar sx={{
            width: 32, height: 32, flexShrink: 0,
            background: 'linear-gradient(135deg, #7c6af5, #a78bfa)',
            fontSize: 14, fontWeight: 700,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          {open && (
            <Box sx={{ overflow: 'hidden' }}>
              <Typography fontWeight={700} fontSize={13} sx={{ color: '#1e1b3a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name?.split(' ')[0] || 'User'}
              </Typography>
              <Typography fontSize={11} sx={{ color: '#9b96c4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </Typography>
            </Box>
          )}
        </Box>

        <Tooltip title={!open ? 'Logout' : ''} placement="right" arrow>
          <Box
            onClick={() => { signOut(); navigate('/login'); }}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 1.5, py: 1.2, borderRadius: 2.5,
              cursor: 'pointer', overflow: 'hidden', color: '#9b96c4',
              transition: 'all 0.18s ease',
              '&:hover': { bgcolor: '#fff0f0', color: '#ef4444' },
            }}
          >
            <LogoutRounded sx={{ fontSize: 21, flexShrink: 0 }} />
            {open && <Typography fontWeight={500} fontSize={14} sx={{ whiteSpace: 'nowrap' }}>Logout</Typography>}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
}
