import React from 'react';
import { Container, Typography, Box, Link } from '@mui/material';

function PrivacyPolicy() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontFamily: '"Playfair Display", serif',
        color: '#2c3e50',
        mb: 4 
      }}>
        Privacy Policy
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          At VIBE Coast, we take your privacy seriously. This policy outlines how we handle your personal information:
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Information We Store
        </Typography>
        <Typography variant="body1" paragraph>
          - Session IDs to track message ownership and prevent duplicate submissions
          - IP addresses for message moderation purposes
          - Message content and author names as provided by users
          - Message read counts and reader tracking
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          - To prevent spam and abuse
          - To track message readership
          - To ensure each user can only submit one message
          - To allow users to see how many people have read their messages
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Your Rights
        </Typography>
        <Typography variant="body1" paragraph>
          You have the right to request removal of your information from our system. To do so, please email{' '}
          <Link href="mailto:josh@joshhills.dev">josh@joshhills.dev</Link> with your request.
        </Typography>

        <Typography variant="body1" paragraph sx={{ mt: 3 }}>
          We aim to process all removal requests within 30 days of receipt.
        </Typography>
      </Box>
    </Container>
  );
}

export default PrivacyPolicy; 