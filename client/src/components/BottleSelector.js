import React from 'react';
import { Grid, Paper } from '@mui/material';
import bottle1 from '../assets/bottles/bottle1.png';
import bottle2 from '../assets/bottles/bottle2.png';
import bottle3 from '../assets/bottles/bottle3.png';
import bottle4 from '../assets/bottles/bottle4.png';
import bottle5 from '../assets/bottles/bottle5.png';
import bottle6 from '../assets/bottles/bottle6.png';
import bottle7 from '../assets/bottles/bottle7.png';
import bottle8 from '../assets/bottles/bottle8.png';

const bottles = [
  { id: 1, image: bottle1 },
  { id: 2, image: bottle2 },
  { id: 3, image: bottle3 },
  { id: 4, image: bottle4 },
  { id: 5, image: bottle5 },
  { id: 6, image: bottle6 },
  { id: 7, image: bottle7 },
  { id: 8, image: bottle8 }
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
                maxHeight: '100px',
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