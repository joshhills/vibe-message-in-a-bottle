import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
} from '@mui/material';

function MessageList({ messages }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          color: '#2c3e50',
          fontFamily: '"Playfair Display", serif',
          mb: 3,
        }}
      >
        Messages from the Sea
      </Typography>
      <Stack spacing={3}>
        {messages.map((message) => (
          <Paper
            key={message._id}
            elevation={1}
            sx={{
              p: 3,
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #e0e0e0',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #3498db, #2c3e50)',
                borderRadius: '4px 4px 0 0',
              },
            }}
          >
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                mb: 2,
                fontFamily: '"Georgia", serif',
              }}
            >
              {message.content}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#666',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontStyle: 'italic' }}>
                — {message.author}
              </Typography>
              <Typography variant="caption">
                {formatDate(message.createdAt)}
              </Typography>
            </Box>
          </Paper>
        ))}
        {messages.length === 0 && (
          <Typography
            variant="body1"
            align="center"
            sx={{ color: '#666', fontStyle: 'italic' }}
          >
            No messages yet. Be the first to cast your message to the sea...
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export default MessageList; 