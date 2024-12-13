'use client';

import React from 'react';
import { Box, CircularProgress, Paper, useTheme } from '@mui/material';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  selectedModel: string;
  isLoading?: boolean;
}

export function ChatWindow({ 
  messages, 
  onSendMessage, 
  selectedModel,
  isLoading = false 
}: ChatWindowProps) {
  const theme = useTheme();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const darkMode = theme.palette.mode === 'dark';
  const bgColor = darkMode ? '#121212' : '#ffffff';

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        bgcolor: bgColor,
        borderRadius: 0,
        '& .MuiPaper-root': {
          bgcolor: bgColor,
        }
      }}
    >
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: bgColor,
        '& > *': {
          bgcolor: bgColor,
        }
      }}>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <ChatInput onSend={onSendMessage} model={selectedModel} />
    </Box>
  );
} 