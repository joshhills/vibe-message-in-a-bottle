import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const FONTS = [
  { id: 1, name: 'Classic', family: '"Georgia", serif' },
  { id: 2, name: 'Modern', family: '"Roboto", sans-serif' },
  { id: 3, name: 'Typewriter', family: '"JetBrains Mono", monospace' },
  { id: 4, name: 'Handwritten', family: '"Indie Flower", cursive' }
];

const FontSelector = ({ selectedFont, onSelect, previewText = "The waves whisper ancient secrets..." }) => {
  return (
    <Grid container spacing={2}>
      {FONTS.map((font) => (
        <Grid item xs={6} sm={6} key={font.id}>
          <Paper
            elevation={selectedFont === font.id ? 8 : 2}
            sx={{
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              border: selectedFont === font.id ? '2px solid #3498db' : '2px solid transparent',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 6
              }
            }}
            onClick={() => onSelect(font.id)}
          >
            <Typography
              variant="subtitle1"
              sx={{
                textAlign: 'center',
                color: selectedFont === font.id ? '#3498db' : 'inherit',
                mb: 1
              }}
            >
              {font.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: font.family,
                textAlign: 'center',
                fontSize: '1.1rem',
                lineHeight: 1.5
              }}
            >
              {previewText}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export { FONTS };
export default FontSelector; 