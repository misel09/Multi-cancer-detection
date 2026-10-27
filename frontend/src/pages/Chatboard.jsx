import { useEffect, useRef, useState } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, CircularProgress, Chip,
} from '@mui/material';
import { SendRounded, SmartToyRounded, PersonRounded } from '@mui/icons-material';
import api from '../services/api';

const SUGGESTIONS = [
  'How do I analyze an image?',
  'Which cancers can this detect?',
  'What does confidence mean?',
  'What is Grad-CAM?',
];

const WELCOME =
  "Hi — I'm the CancerAI assistant. I can explain how to analyze scans, what the 8 cancer groups mean, and how confidence and Grad-CAM work. This is educational help only, not a medical diagnosis.";

export default function Chatboard() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const ask = async (text) => {
    const message = text.trim();
    if (!message || loading) return;

    const next = [...messages, { role: 'user', content: message }];
    setMessages(next);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const history = next
        .filter((_, index) => index > 0)
        .slice(0, -1)
        .map(({ role, content }) => ({ role, content }));
      const { data } = await api.post('/api/chat', { message, history });
      setMessages([...next, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const fallback = typeof detail === 'string'
        ? detail
        : 'Could not reach the chatbot. Please try again.';
      setError(fallback);
      setMessages([
        ...next,
        { role: 'assistant', content: `I couldn't reply just now. ${fallback}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pt: 4, pb: 6, px: { xs: 2, sm: 3, md: 5 }, boxSizing: 'border-box' }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SmartToyRounded sx={{ color: '#7c6af5', fontSize: 28 }} />
          <Typography variant="h4" sx={{ color: '#1e1b3a', fontWeight: 800 }}>
            Chatboard
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#9b96c4', mt: 0.5 }}>
          Ask how to use CancerAI, what each cancer group means, or how results are interpreted.
          This assistant is educational only and is not a medical diagnosis.
        </Typography>
      </Box>

      <Paper sx={{ height: 'calc(100vh - 210px)', minHeight: 420, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {messages.map((m, idx) => {
              const mine = m.role === 'user';
              return (
                <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', flexDirection: mine ? 'row-reverse' : 'row' }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mine ? 'linear-gradient(135deg, #7c6af5, #a78bfa)' : 'rgba(124,106,245,0.12)', color: mine ? '#fff' : '#7c6af5' }}>
                    {mine ? <PersonRounded sx={{ fontSize: 16 }} /> : <SmartToyRounded sx={{ fontSize: 16 }} />}
                  </Box>
                  <Box sx={{ maxWidth: '82%', px: 1.6, py: 1.1, borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: mine ? 'linear-gradient(135deg, #7c6af5, #a78bfa)' : '#f8f7ff', color: mine ? '#fff' : '#1e1b3a', border: mine ? 'none' : '1px solid rgba(124,106,245,0.12)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <Typography fontSize={13.5} lineHeight={1.55}>{m.content}</Typography>
                  </Box>
                </Box>
              );
            })}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#9b96c4', pl: 0.5 }}>
                <CircularProgress size={14} sx={{ color: '#7c6af5' }} />
                <Typography fontSize={12}>Thinking...</Typography>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          {messages.length === 1 && (
            <Box sx={{ px: 2, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {SUGGESTIONS.map((question) => (
                <Chip key={question} label={question} size="small" onClick={() => ask(question)} sx={{ bgcolor: '#f8f7ff', border: '1px solid rgba(124,106,245,0.18)', color: '#5b47e0', fontWeight: 600, '&:hover': { bgcolor: 'rgba(124,106,245,0.1)' } }} />
              ))}
            </Box>
          )}

          {error && <Typography fontSize={11} sx={{ px: 2, pb: 0.5, color: '#ef4444' }}>{error}</Typography>}

          <Box component="form" onSubmit={(event) => { event.preventDefault(); ask(input); }} sx={{ p: 1.5, borderTop: '1px solid rgba(124,106,245,0.1)', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField fullWidth multiline maxRows={4} size="small" placeholder="Ask about analysis, cancer groups, Grad-CAM..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); ask(input); } }} />
            <IconButton type="submit" disabled={loading || !input.trim()} sx={{ background: 'linear-gradient(135deg, #7c6af5, #a78bfa)', color: '#fff', width: 42, height: 42, '&:hover': { background: 'linear-gradient(135deg, #6b57e8, #9270f5)' }, '&.Mui-disabled': { background: 'rgba(124,106,245,0.25)', color: '#fff' } }}>
              <SendRounded fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
