import { Chip } from '@mui/material';

const GROUP_COLORS = {
  'Brain Tumor':         { bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.3)',  text: '#7c3aed' },
  'Breast Cancer':       { bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.3)',  text: '#be185d' },
  'Cervical Cancer':     { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  text: '#b45309' },
  'Colon & Lung Cancer': { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  text: '#047857' },
  'Kidney Cancer':       { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  text: '#1d4ed8' },
  'Leukemia':            { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   text: '#b91c1c' },
  'Oral Cancer':         { bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  text: '#c2410c' },
  'Skin Cancer':         { bg: 'rgba(20,184,166,0.1)',  border: 'rgba(20,184,166,0.3)',  text: '#0f766e' },
};

const DEFAULT = { bg: 'rgba(124,106,245,0.1)', border: 'rgba(124,106,245,0.3)', text: '#5b47e0' };

export default function CancerGroupBadge({ group, size = 'small' }) {
  const c = GROUP_COLORS[group] || DEFAULT;
  return (
    <Chip
      label={group}
      size={size}
      sx={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontWeight: 700,
        fontSize: size === 'small' ? 11 : 13,
      }}
    />
  );
}
