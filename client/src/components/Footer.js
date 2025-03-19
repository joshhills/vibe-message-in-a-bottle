import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: { xs: 2, md: 4 },
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Josh Hills
        </Typography>
        <Link
          href="https://photos.joshhills.dev/store"
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
          color="text.secondary"
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Purchase Magazine
        </Link>
        <Link
          component={RouterLink}
          to="/privacy"
          variant="body2"
          color="text.secondary"
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Privacy Policy
        </Link>
      </Box>
    </Box>
  );
}

export default Footer; 