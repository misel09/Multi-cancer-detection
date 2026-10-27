import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Alert, Tooltip, Button, Chip
} from '@mui/material';
import {
  DeleteRounded, VisibilityRounded, CloudUploadRounded
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePredictions } from '../hooks/usePredictions';
import CancerGroupBadge from '../components/CancerGroupBadge';
import ConfidenceBar from '../components/ConfidenceBar';

const STATUS_CFG = {
  VERIFIED: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)'  },
  REJECTED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)'  },
  PENDING:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
};

export default function History() {
  const { predictions, loading, error, fetchAll, remove } = usePredictions();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    await remove(id);
    setDeleting(null);
  };

  return (
    <Box sx={{ pt: 4, pb: 6, px: { xs: 2, md: 4 } }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ color: '#1e1b3a' }}>Prediction History</Typography>
          <Typography variant="body2" sx={{ color: '#9b96c4', mt: 0.5 }}>
            All your past analyses — click any row to view the full result.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUploadRounded />}
          onClick={() => navigate('/analyze')}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Analyze New
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress sx={{ color: '#7c6af5' }} />
        </Box>
      ) : predictions.length === 0 ? (
        <Paper elevation={1} sx={{
          p: 8, textAlign: 'center', borderRadius: 3,
          background: '#ffffff',
          border: '1px dashed rgba(124,106,245,0.25)',
          boxShadow: '0 4px 20px rgba(124,106,245,0.07)',
        }}>
          <CloudUploadRounded sx={{ fontSize: 56, color: 'rgba(124,106,245,0.25)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6b7094' }}>No predictions yet</Typography>
          <Typography variant="body2" sx={{ color: '#9b96c4', mb: 3 }}>
            Upload your first image to get started.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/analyze')} sx={{ borderRadius: 2 }}>
            Analyze Now
          </Button>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={1}
          sx={{
            borderRadius: 3,
            background: '#ffffff',
            border: '1px solid rgba(124,106,245,0.1)',
            boxShadow: '0 4px 20px rgba(124,106,245,0.07)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{
                background: '#f8f7ff',
                '& th': {
                  color: '#9b96c4', fontWeight: 700, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: 1,
                  borderBottom: '1px solid rgba(124,106,245,0.1)',
                  py: 2,
                },
              }}>
                <TableCell>#</TableCell>
                <TableCell>Cancer Group</TableCell>
                <TableCell>Subtype</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {predictions.map((p) => {
                const s = STATUS_CFG[p.status] || STATUS_CFG.PENDING;
                return (
                  <TableRow
                    key={p.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '& td': { color: '#1e1b3a', py: 1.5 },
                      '&:hover': { background: 'rgba(124,106,245,0.04)' },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                    onClick={() => navigate(`/result/${p.id}`)}
                  >
                    <TableCell sx={{ color: '#9b96c4 !important', fontSize: 12 }}>#{p.id}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <CancerGroupBadge group={p.cancer_group} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.cancer_subtype}</TableCell>
                    <TableCell>
                      <Box sx={{ width: 130 }}>
                        <ConfidenceBar confidence={p.confidence} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.status || 'PENDING'}
                        size="small"
                        sx={{
                          fontSize: 10, fontWeight: 700,
                          color: s.color, background: s.bg,
                          border: `1px solid ${s.border}`,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: '#9b96c4 !important' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View result">
                        <IconButton size="small" onClick={() => navigate(`/result/${p.id}`)}
                          sx={{ color: '#7c6af5', '&:hover': { background: 'rgba(124,106,245,0.1)' } }}>
                          <VisibilityRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239,68,68,0.08)' } }}
                        >
                          {deleting === p.id
                            ? <CircularProgress size={14} sx={{ color: '#ef4444' }} />
                            : <DeleteRounded fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
