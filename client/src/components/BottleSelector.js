import React from 'react';
import { Grid, Paper } from '@mui/material';
import bottle1 from '../assets/bottles/bottle1.svg';
import bottle2 from '../assets/bottles/bottle2.svg';
import bottle3 from '../assets/bottles/bottle3.svg';
import bottle4 from '../assets/bottles/bottle4.svg';
import bottle5 from '../assets/bottles/bottle5.svg';

const bottles = [
  { id: 1, image: bottle1 },
  { id: 2, image: bottle2 },
  { id: 3, image: bottle3 },
  { id: 4, image: bottle4 },
  { id: 5, image: bottle5 }
];

const BottleSelector = ({ selectedBottle, onSelect }) => {
  return (
    <Grid container spacing={2} justifyContent="center">
      {bottles.map((bottle) => (
        <Grid item xs={6} sm={3} key={bottle.id}>
          <Paper
            elevation={selectedBottle === bottle.id ? 8 : 2}
            sx={{
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              border: selectedBottle === bottle.id ? '2px solid #3498db' : '2px solid transparent',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 6
              }
            }}
            onClick={() => onSelect(bottle.id)}
          >
            <img
              src={bottle.image}
              alt={`Bottle ${bottle.id}`}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '140px',
                objectFit: 'contain'
              }}
            />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default BottleSelector; 