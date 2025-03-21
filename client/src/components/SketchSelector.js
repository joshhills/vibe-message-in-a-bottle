import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import heart from '../assets/sketches/heart.svg';
import creature from '../assets/sketches/cat.svg';
import sword from '../assets/sketches/sword.svg';
import balloon from '../assets/sketches/balloon.svg';
import star from '../assets/sketches/star.svg';

const SKETCHES = [
  { id: 0, name: 'None', icon: null },
  { id: 1, name: 'Heart', icon: heart },
  { id: 2, name: 'Creature', icon: creature },
  { id: 3, name: 'Sword', icon: sword },
  { id: 4, name: 'Balloon', icon: balloon },
  { id: 5, name: 'Star', icon: star }
];

const SketchSelector = ({ selectedSketch, onSelect }) => {
  return (
    <Grid container spacing={2}>
      {SKETCHES.map((sketch) => (
        <Grid item xs={6} sm={4} key={sketch.id}>
          <Paper
            elevation={selectedSketch === sketch.id ? 8 : 2}
            sx={{
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              border: selectedSketch === sketch.id ? '2px solid #3498db' : '2px solid transparent',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 6
              },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 120
            }}
            onClick={() => onSelect(sketch.id)}
          >
            {sketch.icon ? (
              <Box
                component="img"
                src={sketch.icon}
                alt={sketch.name}
                sx={{
                  width: 40,
                  height: 40,
                  mb: 1,
                  filter: selectedSketch === sketch.id ? 'invert(40%) sepia(52%) saturate(2878%) hue-rotate(198deg) brightness(104%) contrast(95%)' : 'none'
                }}
              />
            ) : (
              <Box sx={{ width: 40, height: 40, mb: 1 }} />
            )}
            <Typography
              variant="subtitle1"
              sx={{
                textAlign: 'center',
                color: selectedSketch === sketch.id ? '#3498db' : 'inherit'
              }}
            >
              {sketch.name}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export { SKETCHES };
export default SketchSelector; 