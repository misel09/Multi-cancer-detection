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
    <Box sx={{ minHeight: '100vh', background: '#08080f', pt: 10, pb: 6, px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={800} sx={{
            background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.7))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Prediction History
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>
            All your past analyses — click any row to view the full result.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUploadRounded />}
          onClick={() => navigate('/analyze')}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
          }}
        >
          Analyze New
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress sx={{ color: '#818cf8' }} />
        </Box>
      ) : predictions.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 3, background: 'rgba(15,15,45,0.8)', border: '1px dashed rgba(99,102,241,0.2)' }}>
          <CloudUploadRounded sx={{ fontSize: 56, color: '#818cf8', opacity: 0.4, mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>No predictions yet</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', mb: 3 }}>Upload your first image to get started.</Typography>
          <Button variant="contained" onClick={() => navigate('/analyze')}
            sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', textTransform: 'none', borderRadius: 2 }}>
            Analyze Now
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, background: 'rgba(15,15,45,0.9)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' } }}>
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
              {predictions.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white' },
                    '&:hover': { background: 'rgba(99,102,241,0.05)' },
                  }}
                  onClick={() => navigate(`/result/${p.id}`)}
                >
                  <TableCell sx={{ color: 'rgba(255,255,255,0.3) !important', fontSize: 12 }}>#{p.id}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <CancerGroupBadge group={p.cancer_group} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{p.cancer_subtype}</TableCell>
                  <TableCell>
                    <Box sx={{ width: 120 }}>
                      <ConfidenceBar confidence={p.confidence} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.status}
                      size="small"
                      sx={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                        ...(p.status === 'VERIFIED' && { color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }),
                        ...(p.status === 'REJECTED' && { color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }),
                        ...(p.status === 'PENDING' && { color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }),
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5) !important' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View result">
                      <IconButton size="small" onClick={() => navigate(`/result/${p.id}`)} sx={{ color: '#818cf8' }}>
                        <VisibilityRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        sx={{ color: '#f87171', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}
                      >
                        {deleting === p.id ? <CircularProgress size={14} /> : <DeleteRounded fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
