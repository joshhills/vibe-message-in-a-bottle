import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const FONTS = [
  { id: 1, name: 'Georgia', family: '"Georgia", serif' },
  { id: 2, name: 'Playfair Display', family: '"Playfair Display", serif' },
  { id: 3, name: 'Crimson Text', family: '"Crimson Text", serif' },
  { id: 4, name: 'Lora', family: '"Lora", serif' }
];

const FontSelector = ({ selectedFont, onSelect, previewText }) => {
  return (
    <Grid container spacing={2}>
      {FONTS.map((font) => (
        <Grid item xs={12} sm={6} key={font.id}>
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
              variant="h6"
              sx={{
                mb: 1,
                fontFamily: font.family,
                color: selectedFont === font.id ? '#3498db' : 'inherit'
              }}
            >
              {font.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: font.family,
                fontSize: '1.1rem',
                color: '#666'
              }}
            >
              {previewText || "The waves whisper ancient tales of distant shores..."}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export { FONTS };
export default FontSelector; 