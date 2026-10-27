import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar';

const EXPANDED  = 240;
const COLLAPSED = 72;

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Sync with sidebar collapse toggle events
    const onToggle = (e) => setSidebarOpen(e.detail.open);
    window.addEventListener('sidebarToggle', onToggle);

    // Responsive: collapse on small screens by default
    const onResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    onResize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('sidebarToggle', onToggle);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const ml = sidebarOpen ? EXPANDED : COLLAPSED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f0f2fa' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: `${ml}px`,
          width: `calc(100% - ${ml}px)`,
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1)',
          minHeight: '100vh',
          background: '#f0f2fa',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
