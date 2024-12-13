'use client';

import React from 'react';
import { 
  Paper, 
  Typography, 
  IconButton, 
  Box
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getModelLabel = (model?: string) => {
    switch (model) {
      case 'openai':
        return '🤖 GPT-4';
      case 'anthropic':
        return '🧠 Claude';
      case 'gemini':
        return '💫 Gemini';
      default:
        return '👤 User';
    }
  };

  const getModelColor = (model?: string) => {
    switch (model) {
      case 'openai':
        return '#4caf50';  // Green
      case 'anthropic':
        return '#e91e63';  // Pink
      case 'gemini':
        return '#03a9f4';  // Blue
      default:
        return '#e3f2fd';  // Light blue for user
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
        mb: 2 
      }}
    >
      <Box sx={{ maxWidth: '80%' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            ml: 1, 
            mb: 0.5, 
            display: 'block',
            color: 'text.secondary',
            fontSize: '1.25rem'
          }}
        >
          {message.role === 'user' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
              <PersonIcon sx={{ fontSize: 20 }} />
              <span>User</span>
            </Box>
          ) : (
            <span>{getModelLabel(message.model)}</span>
          )}
        </Typography>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: message.role === 'user' ? '#e3f2fd' : getModelColor(message.model),
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              color: 'text.primary'
            }}
          >
            {message.content}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <IconButton 
              size="small" 
              onClick={handleCopy}
              sx={{ 
                opacity: 0.7,
                '&:hover': { opacity: 1 },
                color: 'inherit'
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
} 