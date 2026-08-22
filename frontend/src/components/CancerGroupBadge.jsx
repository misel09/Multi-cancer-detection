import { Chip } from '@mui/material';

const GROUP_COLORS = {
  'Brain Tumor':          { bg: 'rgba(139,92,246,0.2)', border: 'rgba(139,92,246,0.5)', text: '#a78bfa' },
  'Breast Cancer':        { bg: 'rgba(236,72,153,0.2)', border: 'rgba(236,72,153,0.5)', text: '#f472b6' },
  'Cervical Cancer':      { bg: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,0.5)', text: '#fbbf24' },
  'Colon & Lung Cancer':  { bg: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.5)', text: '#34d399' },
  'Kidney Cancer':        { bg: 'rgba(59,130,246,0.2)', border: 'rgba(59,130,246,0.5)', text: '#60a5fa' },
  'Leukemia':             { bg: 'rgba(239,68,68,0.2)',  border: 'rgba(239,68,68,0.5)',  text: '#f87171' },
  'Oral Cancer':          { bg: 'rgba(249,115,22,0.2)', border: 'rgba(249,115,22,0.5)', text: '#fb923c' },
  'Skin Cancer':          { bg: 'rgba(20,184,166,0.2)', border: 'rgba(20,184,166,0.5)', text: '#2dd4bf' },
};

const DEFAULT = { bg: 'rgba(99,102,241,0.2)', border: 'rgba(99,102,241,0.5)', text: '#818cf8' };

export default function CancerGroupBadge({ group, size = 'small' }) {
  const colors = GROUP_COLORS[group] || DEFAULT;
  return (
    <Chip
      label={group}
      size={size}
      sx={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontWeight: 700,
        fontSize: size === 'small' ? 11 : 13,
      }}
    />
  );
}
