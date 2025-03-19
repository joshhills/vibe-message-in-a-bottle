import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
  Stepper,
  Step,
  StepLabel,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SkipNextIcon from '@mui/icons-material/SkipNext';

const steps = ['Choose Your Bottle', 'Sign Your Message', 'Write Your Message'];

const bottleStyles = [
  { id: 1, label: 'Classic Wine Bottle' },
  { id: 2, label: 'Vintage Flask' },
  { id: 3, label: 'Sea Glass Bottle' },
  { id: 4, label: 'Ornate Perfume Bottle' },
  { id: 5, label: 'Ancient Amphora' },
];

function MessageForm({ onSubmit }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    author: '',
    content: '',
    bottleStyle: null,
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSkip = () => {
    if (activeStep === 0) {
      // If skipping bottle selection, choose a random bottle
      setFormData(prev => ({
        ...prev,
        bottleStyle: Math.floor(Math.random() * 5) + 1
      }));
    } else if (activeStep === 1) {
      // If skipping name, set as Anonymous
      setFormData(prev => ({
        ...prev,
        author: 'Anonymous'
      }));
    }
    handleNext();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBottleSelect = (bottleId) => {
    setFormData(prev => ({
      ...prev,
      bottleStyle: bottleId
    }));
    handleNext();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.content.trim() && formData.bottleStyle) {
      // If no author is provided, set it to Anonymous
      const finalFormData = {
        ...formData,
        author: formData.author.trim() || 'Anonymous'
      };
      onSubmit(finalFormData);
      setFormData({ author: '', content: '', bottleStyle: null });
      setActiveStep(0);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Select a bottle for your message:
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {bottleStyles.map((bottle) => (
                <Button
                  key={bottle.id}
                  variant={formData.bottleStyle === bottle.id ? "contained" : "outlined"}
                  onClick={() => handleBottleSelect(bottle.id)}
                  sx={{
                    py: 2,
                    justifyContent: 'flex-start',
                    background: formData.bottleStyle === bottle.id ? '#3498db' : 'transparent',
                    '&:hover': {
                      background: formData.bottleStyle === bottle.id ? '#2980b9' : 'rgba(52, 152, 219, 0.1)',
                    },
                  }}
                >
                  {bottle.label}
                </Button>
              ))}
            </Stack>
          </Box>
        );
      case 1:
        return (
          <TextField
            fullWidth
            label="Your Name (Optional)"
            name="author"
            value={formData.author}
            onChange={handleChange}
            variant="outlined"
            helperText="Leave blank to remain anonymous"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#3498db',
                },
              },
            }}
          />
        );
      case 2:
        return (
          <TextField
            required
            fullWidth
            multiline
            rows={6}
            label="Your Message"
            name="content"
            value={formData.content}
            onChange={handleChange}
            variant="outlined"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#3498db',
                },
              },
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 4,
        background: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid #e0e0e0',
      }}
    >
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box component="form" onSubmit={handleSubmit}>
        {getStepContent(activeStep)}

        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 4 }}
        >
          <Box>
            {activeStep > 0 && (
              <IconButton onClick={handleBack}>
                <ArrowBackIcon />
              </IconButton>
            )}
          </Box>

          <Box>
            {activeStep < steps.length - 1 ? (
              <>
                <IconButton 
                  onClick={handleSkip}
                  sx={{ mr: 1 }}
                  title={activeStep === 0 ? "Choose random bottle" : "Skip (remain anonymous)"}
                >
                  <SkipNextIcon />
                </IconButton>
                {(activeStep === 0 && formData.bottleStyle) || (activeStep === 1) ? (
                  <IconButton onClick={handleNext}>
                    <ArrowForwardIcon />
                  </IconButton>
                ) : null}
              </>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={!formData.content.trim() || !formData.bottleStyle}
                sx={{
                  background: '#3498db',
                  '&:hover': {
                    background: '#2980b9',
                  },
                }}
              >
                Cast Your Message to the Sea
              </Button>
            )}
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

export default MessageForm; 