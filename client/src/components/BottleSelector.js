import React from 'react';
import { Box, Typography } from '@mui/material';
import bottle1 from '../assets/bottles/bottle1.svg';
import bottle2 from '../assets/bottles/bottle2.svg';
import bottle3 from '../assets/bottles/bottle3.svg';
import bottle4 from '../assets/bottles/bottle4.svg';
import bottle5 from '../assets/bottles/bottle5.svg';

const bottles = [bottle1, bottle2, bottle3, bottle4, bottle5];

const BottleSelector = ({ selectedBottle, onSelect }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{
          color: '#2c3e50',
          mb: 2,
          fontFamily: '"Playfair Display", serif',
        }}
      >
        Choose a bottle for your message:
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {bottles.map((bottle, index) => (
          <Box
            key={index}
            onClick={() => onSelect(index + 1)}
            sx={{
              cursor: 'pointer',
              padding: 1,
              borderRadius: 1,
              border: '2px solid',
              borderColor: selectedBottle === index + 1 ? '#3498db' : 'transparent',
              transition: 'all 0.3s ease',
              background: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <img
              src={bottle}
              alt={`Bottle style ${index + 1}`}
              style={{
                width: '40px',
                height: '80px',
                objectFit: 'contain',
                opacity: 0.9,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default BottleSelector; 