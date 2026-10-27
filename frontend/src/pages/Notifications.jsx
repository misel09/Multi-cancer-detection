import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Divider,
  IconButton, Tooltip, Badge,
} from '@mui/material';
import {
  NotificationsRounded, CheckCircleRounded, CancelRounded,
  HourglassEmptyRounded, PersonAddRounded, AssessmentRounded,
  DoneAllRounded, DeleteSweepRounded,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const STORAGE_KEY = 'cancerAI_notifications';

// ── Generate demo notifications based on the logged-in user ─────────────────
const buildDefaultNotifications = (userName) => [
  {
    id: 1,
    type: 'verified',
    title: 'Prediction Verified',
    message: 'Analysis #3 was marked as VERIFIED by the system.',
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: 2,
    type: 'pending',
    title: 'Pending Review',
    message: 'Analysis #7 is still awaiting doctor verification.',
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: 3,
    type: 'rejected',
    title: 'Prediction Rejected',
    message: 'Analysis #1 was marked REJECTED — AI prediction overridden.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: 4,
    type: 'new_user',
    title: 'Welcome to CancerAI',
    message: `Hi ${userName}, your account is set up and ready to use.`,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: 5,
    type: 'scan',
    title: 'New Scan Uploaded',
    message: 'A new medical image was uploaded and is being processed.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
  },
];

const TYPE_CFG = {
  verified:  { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  icon: <CheckCircleRounded fontSize="small" /> },
  rejected:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: <CancelRounded fontSize="small" /> },
  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <HourglassEmptyRounded fontSize="small" /> },
  new_user:  { color: '#7c6af5', bg: 'rgba(124,106,245,0.1)', icon: <PersonAddRounded fontSize="small" /> },
  scan:      { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <AssessmentRounded fontSize="small" /> },
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)           return `${diff}s ago`;
  if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);

  // Load from localStorage, seed defaults if first visit
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNotifs(JSON.parse(stored));
    } else {
      const defaults = buildDefaultNotifications(user?.name?.split(' ')[0] || 'there');
      setNotifs(defaults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
  }, [user]);

  const save = (updated) => {
    setNotifs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const markRead = (id) => save(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => save(notifs.map(n => ({ ...n, read: true })));
  const clearAll = () => save([]);

  const unread = notifs.filter(n => !n.read).length;

  return (
    <Box sx={{ minHeight: '100vh', pt: 4, pb: 8, px: { xs: 2, sm: 3, md: 5 }, boxSizing: 'border-box' }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid rgba(124,106,245,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Badge badgeContent={unread} color="error" max={99}>
              <NotificationsRounded sx={{ color: '#7c6af5', fontSize: 28 }} />
            </Badge>
            <Typography variant="h4" sx={{ color: '#1e1b3a', fontWeight: 800 }}>Notifications</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#9b96c4', mt: 0.5 }}>
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up!'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {unread > 0 && (
            <Tooltip title="Mark all as read">
              <Button
                size="small" startIcon={<DoneAllRounded />}
                onClick={markAllRead}
                sx={{ borderRadius: 2, color: '#7c6af5', borderColor: 'rgba(124,106,245,0.3)', border: '1px solid' }}
              >
                Mark all read
              </Button>
            </Tooltip>
          )}
          {notifs.length > 0 && (
            <Tooltip title="Clear all notifications">
              <Button
                size="small" startIcon={<DeleteSweepRounded />}
                onClick={clearAll}
                sx={{ borderRadius: 2, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', border: '1px solid' }}
              >
                Clear all
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── Notification list ── */}
      {notifs.length === 0 ? (
        <Box sx={{
          textAlign: 'center', py: 10,
          border: '2px dashed rgba(124,106,245,0.15)',
          borderRadius: 4,
        }}>
          <NotificationsRounded sx={{ fontSize: 56, color: 'rgba(124,106,245,0.2)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#9b96c4' }}>No notifications</Typography>
          <Typography variant="body2" sx={{ color: '#c4bfe8' }}>You're all caught up!</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {notifs.map((n, idx) => {
            const cfg = TYPE_CFG[n.type] || TYPE_CFG.scan;
            return (
              <Paper
                key={n.id}
                elevation={n.read ? 0 : 1}
                onClick={() => markRead(n.id)}
                sx={{
                  p: 2.5, borderRadius: 3, cursor: n.read ? 'default' : 'pointer',
                  border: n.read
                    ? '1px solid rgba(124,106,245,0.08)'
                    : '1px solid rgba(124,106,245,0.2)',
                  background: n.read ? '#fdfdff' : '#ffffff',
                  boxShadow: n.read ? 'none' : '0 4px 16px rgba(124,106,245,0.08)',
                  transition: 'all 0.18s ease',
                  '&:hover': { transform: n.read ? 'none' : 'translateX(4px)', boxShadow: n.read ? 'none' : '0 6px 20px rgba(124,106,245,0.12)' },
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Unread indicator bar */}
                {!n.read && (
                  <Box sx={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}88)`,
                    borderRadius: '3px 0 0 3px',
                  }} />
                )}

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, pl: n.read ? 0 : 0.5 }}>
                  {/* Icon */}
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                    background: cfg.bg, border: `1px solid ${cfg.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cfg.color,
                  }}>
                    {cfg.icon}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography fontWeight={n.read ? 600 : 800} fontSize={14} sx={{ color: '#1e1b3a' }}>
                        {n.title}
                      </Typography>
                      {!n.read && (
                        <Chip label="New" size="small" sx={{
                          height: 18, fontSize: 10, fontWeight: 700,
                          color: '#7c6af5', background: 'rgba(124,106,245,0.1)',
                          border: '1px solid rgba(124,106,245,0.2)',
                        }} />
                      )}
                    </Box>
                    <Typography fontSize={13} sx={{ color: '#6b7094', mt: 0.3, lineHeight: 1.5 }}>
                      {n.message}
                    </Typography>
                    <Typography fontSize={11} sx={{ color: '#c4bfe8', mt: 0.5 }}>
                      {timeAgo(n.time)}
                    </Typography>
                  </Box>
                </Box>

                {idx < notifs.length - 1 && false /* spacer handled by gap */ }
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
