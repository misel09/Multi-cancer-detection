import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Button, CircularProgress,
  Alert, Divider, Chip, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogContentText
} from '@mui/material';
import {
  ArrowBackRounded, DownloadRounded, DeleteRounded,
  CalendarTodayRounded, SmartToyRounded, CheckCircleOutlineRounded, 
  CancelRounded, InfoRounded
} from '@mui/icons-material';
import { getPrediction, updatePredictionStatus } from '../services/predictions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import GradCamViewer from '../components/GradCamViewer';
import ConfidenceBar from '../components/ConfidenceBar';
import CancerGroupBadge from '../components/CancerGroupBadge';

export default function PredictionResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pred, setPred] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    getPrediction(id)
      .then((r) => setPred(r.data))
      .catch(() => setError('Prediction not found or access denied.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`prediction_report_${pred.id}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
    setDownloading(false);
  };

  const handleVerify = async (status) => {
    setVerifying(true);
    try {
      const res = await updatePredictionStatus(pred.id, status, status === 'REJECTED' ? 'AI prediction overridden.' : 'Confirmed by doctor.');
      setPred(res.data);
    } catch (err) {
      console.error('Failed to update status', err);
    }
    setVerifying(false);
  };

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: '#14b8a6' }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ minHeight: '100vh', pt: 4, px: 4 }}>
      <Alert severity="error">{error}</Alert>
      <Button onClick={() => navigate('/history')} sx={{ mt: 2, color: '#818cf8' }}>← Back to History</Button>
    </Box>
  );

  const gradcamSrc = pred.gradcam_path
    ? `http://localhost:8000/${pred.gradcam_path.replace(/\\/g, '/')}`
    : null;

  const originalUrl = pred.image_path
    ? `http://localhost:8000/${pred.image_path.replace(/\\/g, '/')}`
    : null;

  // Try to get gradcam from path URL served by FastAPI static mount
  // The gradcam_base64 isn't stored in DB — we re-read the saved PNG
  return (
    <Box sx={{ minHeight: '100vh', pt: 4, pb: 6, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate('/history')}
            sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none', '&:hover': { color: 'white' } }}
          >
            Back to History
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            startIcon={downloading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <DownloadRounded />}
            onClick={handleDownloadPDF}
            disabled={downloading}
            variant="outlined"
            sx={{ color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)', textTransform: 'none', borderRadius: 2 }}
          >
            Download PDF
          </Button>
          <Chip
            label={`ID #${pred.id}`}
            size="small"
            sx={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
          />
        </Box>

        <div ref={reportRef} style={{ background: '#08080f', padding: '16px', borderRadius: '12px' }}>
          <Grid container spacing={3}>
          {/* Left: Grad-CAM */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(15,15,45,0.9)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                  Explainability Visualization
                </Typography>
                <IconButton onClick={() => setInfoOpen(true)} size="small" sx={{ ml: 1, color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'white' } }}>
                  <InfoRounded fontSize="small" />
                </IconButton>
              </Box>
              {gradcamSrc ? (
                <GradCamViewer
                  gradcamSrc={gradcamSrc}
                  originalUrl={originalUrl}
                  cancerGroup={pred.cancer_group}
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.3)' }}>
                  <Typography>Grad-CAM image not generated for this analysis.</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right: Results */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(15,15,45,0.9)', border: '1px solid rgba(99,102,241,0.15)', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'white', mb: 2 }}>
                Classification Result
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Cancer Group
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <CancerGroupBadge group={pred.cancer_group} size="medium" />
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Subtype
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: 'white', mt: 0.5 }}>
                  {pred.cancer_subtype}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />

              <ConfidenceBar confidence={pred.confidence} />
            </Paper>

            {/* Meta */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'rgba(15,15,45,0.9)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                Analysis Metadata
              </Typography>
              {[
                { label: 'File', value: pred.image_filename || '—' },
                { label: 'Model Version', value: pred.model_version, icon: <SmartToyRounded fontSize="small" sx={{ color: '#818cf8' }} /> },
                { label: 'Analyzed', value: new Date(pred.created_at).toLocaleString(), icon: <CalendarTodayRounded fontSize="small" sx={{ color: '#818cf8' }} /> },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{item.value}</Typography>
                </Box>
              ))}

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                Doctor Verification
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Status</Typography>
                <Chip
                  label={pred.status || 'PENDING'}
                  size="small"
                  sx={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                    ...((pred.status === 'VERIFIED') && { color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }),
                    ...((pred.status === 'REJECTED') && { color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }),
                    ...((!pred.status || pred.status === 'PENDING') && { color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }),
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    disabled={verifying}
                    startIcon={<CheckCircleOutlineRounded />}
                    onClick={() => handleVerify('VERIFIED')}
                    sx={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', '&:hover': { background: 'rgba(74,222,128,0.25)' }, textTransform: 'none' }}
                  >
                    Approve
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    disabled={verifying}
                    startIcon={<CancelRounded />}
                    onClick={() => handleVerify('REJECTED')}
                    sx={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', '&:hover': { background: 'rgba(248,113,113,0.25)' }, textTransform: 'none' }}
                  >
                    Reject
                  </Button>
                </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/analyze')}
                  sx={{ textTransform: 'none', borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8', borderRadius: 2 }}
                >
                  Analyze Another
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/history')}
                  sx={{ textTransform: 'none', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: 2 }}
                >
                  View History
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Disclaimer */}
        <Paper elevation={0} sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(245,158,11,0.9)' }}>
            ⚠️ <strong>Research prototype only.</strong> This analysis is generated by a sample model for demonstration purposes. Do not use for actual medical diagnosis. Consult a qualified medical professional.
          </Typography>
        </Paper>
        </div>
      </Box>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: '#0a0a14', color: 'white', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoRounded sx={{ color: '#818cf8' }} />
          How to read Grad-CAM
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
            Grad-CAM (Gradient-weighted Class Activation Mapping) highlights the regions in the image that the AI focused on the most when making its prediction.
          </DialogContentText>
          <Box sx={{ textAlign: 'center' }}>
            <img src="/sample_gradcam.png" alt="Sample Grad-CAM" style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }} />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.5)' }}>
              <strong>Red/Yellow (Hot):</strong> High importance regions.<br />
              <strong>Blue/Green (Cool):</strong> Low importance regions.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
