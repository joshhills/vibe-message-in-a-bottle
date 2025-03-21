import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography, Paper, Fade, Button, TextField, Stack, IconButton } from '@mui/material';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { NARRATIVE_MESSAGES, ERROR_MESSAGES } from './config/messages';
import { MESSAGE_CONSTRAINTS, DISPLAY_SETTINGS } from './config/constraints';
import logo from './assets/logo.svg';
import background from './assets/background.jpg';
import BottleSelector from './components/BottleSelector';
import bottle1 from './assets/bottles/bottle1.svg';
import bottle2 from './assets/bottles/bottle2.svg';
import bottle3 from './assets/bottles/bottle3.svg';
import bottle4 from './assets/bottles/bottle4.svg';
import bottle5 from './assets/bottles/bottle5.svg';
import beachAmbience from './assets/beach-ambience.mp3';
import pageUnfolding1 from './assets/page-unfolding-1.mp3';
import pageUnfolding2 from './assets/page-unfolding-2.mp3';
import pageUnfolding3 from './assets/page-unfolding-3.mp3';
import bottleClink1 from './assets/bottle-clink-1.mp3';
import bottleClink2 from './assets/bottle-clink-2.mp3';
import bottleClink3 from './assets/bottle-clink-3.mp3';
import bottleClink4 from './assets/bottle-clink-4.mp3';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useNavigate } from 'react-router-dom';
import Footer from './components/Footer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { differenceInDays } from 'date-fns';
import FontSelector, { FONTS } from './components/FontSelector';
import SketchSelector, { SKETCHES } from './components/SketchSelector';
import AdminPanel from './components/AdminPanel';
import MessageForm from './components/MessageForm';
import { getFontFamily } from './utils/fontUtils';
import { getSmudgedText } from './utils/textUtils';
import { getDeterministicSpots } from './utils/spotUtils';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
    },
    secondary: {
      main: '#3498db',
    },
    background: {
      default: '#f5f6fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Playfair Display", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3011';

const STATES = {
  LOADING: 'loading',
  SHOW_SCENE: 'showScene',
  SHOW_INITIAL_MESSAGE: 'showInitialMessage',
  SHOW_BOTTLE: 'showBottle',
  SHOW_MESSAGE: 'showMessage',
  SHOW_FORM: 'showForm',
  SENDING_MESSAGE: 'sendingMessage',
  SHOW_POST_SUBMIT: 'showPostSubmit',
  SHOW_DISCOVER: 'showDiscover',
  SHOW_FAMILIAR: 'showFamiliar'
};

const FORM_STEPS = {
  BOTTLE: 'bottle',
  FONT: 'font',
  MESSAGE: 'message',
  NAME: 'name',
  SKETCH: 'sketch'
};

const bottles = [bottle1, bottle2, bottle3, bottle4, bottle5];

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box sx={{ flex: 1 }}>
          <MainApp />
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

function MainApp() {
  const [sessionId] = useState(() => {
    const storedId = localStorage.getItem('sessionId');
    if (storedId) return storedId;
    const newId = uuidv4();
    localStorage.setItem('sessionId', newId);
    return newId;
  });
  const [currentMessage, setCurrentMessage] = useState(null);
  const [currentState, setCurrentState] = useState(STATES.LOADING);
  const [error, setError] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(() => {
    const stored = localStorage.getItem('hasSubmitted');
    return stored === 'true';
  });
  const [userMessageId, setUserMessageId] = useState(() => {
    return localStorage.getItem('userMessageId');
  });
  const [bottleSpottedMessage, setBottleSpottedMessage] = useState(() => {
    const messages = NARRATIVE_MESSAGES.BOTTLE_SPOTTED;
    return messages[Math.floor(Math.random() * messages.length)];
  });
  const [newMessageAppearsText, setNewMessageAppearsText] = useState(() => {
    const messages = NARRATIVE_MESSAGES.NEW_MESSAGE_APPEARS;
    return messages[Math.floor(Math.random() * messages.length)];
  });
  const [messageSentText, setMessageSentText] = useState(() => {
    const messages = NARRATIVE_MESSAGES.MESSAGE_SENT;
    return messages[Math.floor(Math.random() * messages.length)];
  });
  const [authorLength, setAuthorLength] = useState(0);
  const [contentLength, setContentLength] = useState(0);
  const [showAuthorHint, setShowAuthorHint] = useState(false);
  const [showContentHint, setShowContentHint] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState(1);
  const [currentBottle, setCurrentBottle] = useState(1);
  const [formStep, setFormStep] = useState(FORM_STEPS.BOTTLE);
  const [messageContent, setMessageContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [familiarMessageText, setFamiliarMessageText] = useState(() => {
    const messages = NARRATIVE_MESSAGES.FAMILIAR_MESSAGE;
    return messages[Math.floor(Math.random() * messages.length)];
  });
  const [seenMessageIds] = useState(() => new Set());
  const [messageCount, setMessageCount] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const audioRef = useRef(null);
  const unfoldingSoundsRef = useRef([
    new Audio(pageUnfolding1),
    new Audio(pageUnfolding2),
    new Audio(pageUnfolding3)
  ]);
  const bottleClinkSoundsRef = useRef([
    new Audio(bottleClink1),
    new Audio(bottleClink2),
    new Audio(bottleClink3),
    new Audio(bottleClink4)
  ]);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedFont, setSelectedFont] = useState(1);
  const [selectedSketch, setSelectedSketch] = useState(0);

  const getRandomMessage = (messageArray) => {
    return messageArray[Math.floor(Math.random() * messageArray.length)];
  };

  const fetchRandomMessage = async () => {
    try {
      const shouldForceOwnMessage = hasSubmitted && 
        messageCount > 0 && 
        messageCount % MESSAGE_CONSTRAINTS.MESSAGE_DISPLAY.SHOW_OWN_MESSAGE_EVERY === 0;

      const response = await axios.get(`${API_URL}/api/messages/random`, {
        params: {
          sessionId, 
          ...(shouldForceOwnMessage ? {} : { excludeMessageId: userMessageId }),
          previousMessageId: currentMessage?._id || null,
          forceOwnMessage: shouldForceOwnMessage
        }
      });

      const message = response.data;
      
      // Set a random bottle style if one isn't provided
      setCurrentBottle(message.bottleStyle || Math.floor(Math.random() * 5) + 1);
      
      // Set a new random rotation
      setCurrentRotation(Math.random() * 8 - 4);

      // Increment message count for ALL messages
      setMessageCount(prev => prev + 1);
      
      // Check if we've seen this message before
      if (seenMessageIds.has(message._id)) {
        setFamiliarMessageText(getRandomMessage(NARRATIVE_MESSAGES.FAMILIAR_MESSAGE));
        setCurrentMessage(message);
        setCurrentState(STATES.SHOW_FAMILIAR);
      } else if (message.sessionId === sessionId) {
        // Check if this is the user's own message
        setFamiliarMessageText(getRandomMessage(NARRATIVE_MESSAGES.OWN_MESSAGE));
        setCurrentMessage(message);
        setCurrentState(STATES.SHOW_FAMILIAR);
      } else {
        // Set the message and show the bottle
        setCurrentMessage(message);
        setCurrentState(STATES.SHOW_BOTTLE);
        seenMessageIds.add(message._id);
      }
    } catch (error) {
      console.error('Error fetching message:', error);
      setError(ERROR_MESSAGES.FETCH_ERROR);
      // If we can't get a new message, show the error briefly and then return to bottle state
      setTimeout(() => {
        setError(null);
        setCurrentState(STATES.SHOW_BOTTLE);
      }, 2000);
    }
  };

  const handleMessageClose = () => {
    if (!hasSubmitted) {
      setCurrentState(STATES.SHOW_FORM);
    } else {
      setNewMessageAppearsText(getRandomMessage(NARRATIVE_MESSAGES.NEW_MESSAGE_APPEARS));
      setCurrentState(STATES.SHOW_DISCOVER);
      setTimeout(() => {
        setCurrentState(STATES.LOADING);
        fetchRandomMessage();
      }, 2000);
    }
  };

  const handleSkipMessage = () => {
    // Just prepare next bottle without setting hasSubmitted
    const nextBottle = Math.floor(Math.random() * 5) + 1;
    setCurrentBottle(nextBottle);
    setCurrentRotation(Math.random() * 8 - 4);  // Add random rotation here
    setNewMessageAppearsText(getRandomMessage(NARRATIVE_MESSAGES.NEW_MESSAGE_APPEARS));
    setCurrentState(STATES.SHOW_DISCOVER);
    setTimeout(() => {
      setCurrentState(STATES.SHOW_BOTTLE);
    }, 2000);
  };

  const handleSubmitMessage = async (event) => {
    event.preventDefault();
    setCurrentState(STATES.SENDING_MESSAGE);

    try {
      const response = await axios.post(`${API_URL}/api/messages`, {
        author: authorName,
        content: messageContent,
        bottleStyle: selectedBottle,
        font: selectedFont,
        sketch: selectedSketch,
        sessionId
      });

      setUserMessageId(response.data._id);
      localStorage.setItem('userMessageId', response.data._id);
      setHasSubmitted(true);
      localStorage.setItem('hasSubmitted', 'true');
      
      // Reset form state
      setMessageContent('');
      setAuthorName('');
      setContentLength(0);
      setAuthorLength(0);
      
      // Show post-submit message
      setMessageSentText(getRandomMessage(NARRATIVE_MESSAGES.MESSAGE_PENDING));
      setCurrentState(STATES.SHOW_POST_SUBMIT);
      
      // After showing the success message, fetch a new message
      setTimeout(() => {
        setNewMessageAppearsText(getRandomMessage(NARRATIVE_MESSAGES.NEW_MESSAGE_APPEARS));
        setCurrentState(STATES.SHOW_DISCOVER);
        setTimeout(() => {
          setCurrentState(STATES.LOADING);
          fetchRandomMessage();
        }, 2000);
      }, 2000);
    } catch (error) {
      if (error.response?.status === 403) {
        setError(ERROR_MESSAGES.ALREADY_SUBMITTED);
        // If we get a 403, update our local state to match the server
        setHasSubmitted(true);
        localStorage.setItem('hasSubmitted', 'true');
        // Close the form and show the bottle
        setCurrentState(STATES.SHOW_BOTTLE);
      } else {
        setError(ERROR_MESSAGES.SUBMIT_ERROR);
        setCurrentState(STATES.SHOW_FORM);
      }
    }
  };

  const renderFormStep = () => {
    switch (formStep) {
      case FORM_STEPS.BOTTLE:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 4, color: '#2c3e50', fontFamily: '"Playfair Display", serif' }}>
              Cast Your Message to the Sea
            </Typography>
            <BottleSelector selectedBottle={selectedBottle} onSelect={(bottleId) => {
              setSelectedBottle(bottleId);
              setTimeout(() => setFormStep(FORM_STEPS.FONT), 50);
            }} />
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              <Button
                variant="text"
                onClick={handleSkipMessage}
                sx={{ color: '#666' }}
              >
                {NARRATIVE_MESSAGES.WRITE_FORM_SKIP}
              </Button>
              <Button 
                variant="text" 
                onClick={() => {
                  const randomBottle = Math.floor(Math.random() * 5) + 1;
                  setSelectedBottle(randomBottle);
                  setTimeout(() => setFormStep(FORM_STEPS.FONT), 50);
                }}
              >
                Choose Random Bottle
              </Button>
            </Stack>
          </Box>
        );
      
      case FORM_STEPS.FONT:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 4, color: '#2c3e50', fontFamily: '"Playfair Display", serif' }}>
              Choose Your Message Style
            </Typography>
            <FontSelector
              selectedFont={selectedFont}
              onSelect={(fontId) => {
                setSelectedFont(fontId);
                setTimeout(() => setFormStep(FORM_STEPS.MESSAGE), 50);
              }}
              previewText={messageContent || undefined}
            />
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button variant="text" onClick={() => setFormStep(FORM_STEPS.BOTTLE)}>
                Back
              </Button>
              <Button 
                variant="text" 
                onClick={() => {
                  const randomFont = Math.floor(Math.random() * FONTS.length) + 1;
                  setSelectedFont(randomFont);
                  setTimeout(() => setFormStep(FORM_STEPS.MESSAGE), 50);
                }}
              >
                Choose Random Font
              </Button>
            </Stack>
          </Box>
        );
      
      case FORM_STEPS.MESSAGE:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 4, color: '#2c3e50', fontFamily: '"Playfair Display", serif' }}>
              Write Your Message
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value);
                setContentLength(e.target.value.length);
                setShowContentHint(false); // Reset hint when typing
              }}
              onBlur={() => {
                if (contentLength > 0 && contentLength < MESSAGE_CONSTRAINTS.CONTENT.MIN_LENGTH) {
                  setTimeout(() => setShowContentHint(true), 1500);
                }
              }}
              placeholder="Share your thoughts with the world..."
              helperText={showContentHint && contentLength > 0 && contentLength < MESSAGE_CONSTRAINTS.CONTENT.MIN_LENGTH ? 
                `Message must be at least ${MESSAGE_CONSTRAINTS.CONTENT.MIN_LENGTH} characters` :
                `${contentLength}/${MESSAGE_CONSTRAINTS.CONTENT.MAX_LENGTH} characters`}
              sx={{
                mb: 3,
                '& .MuiInputBase-input': {
                  fontFamily: getFontFamily(selectedFont),
                  fontSize: '1.25rem',
                  lineHeight: 1.5
                },
                '& .MuiFormHelperText-root': {
                  fontFamily: 'Roboto, sans-serif' // Keep helper text in standard font
                }
              }}
            />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="text" onClick={() => setFormStep(FORM_STEPS.FONT)}>
                Back
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setFormStep(FORM_STEPS.NAME)}
                disabled={contentLength < MESSAGE_CONSTRAINTS.CONTENT.MIN_LENGTH || contentLength > MESSAGE_CONSTRAINTS.CONTENT.MAX_LENGTH}
                sx={{
                  background: '#3498db',
                  '&:hover': { background: '#2980b9' },
                }}
              >
                Next
              </Button>
            </Stack>
          </Box>
        );
      
      case FORM_STEPS.NAME:
        return (
          <Box component="form" onSubmit={(e) => {
            e.preventDefault();
            setFormStep(FORM_STEPS.SKETCH);
          }} sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 4, color: '#2c3e50', fontFamily: '"Playfair Display", serif' }}>
              Sign Your Message
            </Typography>
            <TextField
              fullWidth
              value={authorName}
              onChange={(e) => {
                setAuthorName(e.target.value);
                setAuthorLength(e.target.value.length);
                setShowAuthorHint(false); // Reset hint when typing
              }}
              onBlur={() => {
                if (authorLength > 0 && authorLength < MESSAGE_CONSTRAINTS.AUTHOR.MIN_LENGTH) {
                  setTimeout(() => setShowAuthorHint(true), 1500);
                }
              }}
              placeholder="Your name or leave blank to remain anonymous"
              helperText={showAuthorHint && authorLength > 0 && authorLength < MESSAGE_CONSTRAINTS.AUTHOR.MIN_LENGTH ?
                `Name must be at least ${MESSAGE_CONSTRAINTS.AUTHOR.MIN_LENGTH} characters` :
                authorLength > 0 ? `${authorLength}/${MESSAGE_CONSTRAINTS.AUTHOR.MAX_LENGTH} characters` : 'Leave blank to remain anonymous'}
              sx={{
                mb: 3,
                '& .MuiInputBase-input': {
                  fontFamily: getFontFamily(selectedFont),
                  fontSize: '1.25rem',
                  textAlign: 'center'
                },
                '& .MuiFormHelperText-root': {
                  fontFamily: 'Roboto, sans-serif' // Keep helper text in standard font
                }
              }}
            />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="text" onClick={() => setFormStep(FORM_STEPS.MESSAGE)}>
                Back
              </Button>
              <Button 
                type="submit"
                variant="contained"
                disabled={authorLength > 0 && (authorLength < MESSAGE_CONSTRAINTS.AUTHOR.MIN_LENGTH || authorLength > MESSAGE_CONSTRAINTS.AUTHOR.MAX_LENGTH)}
                sx={{
                  background: '#3498db',
                  '&:hover': { background: '#2980b9' },
                }}
              >
                Next
              </Button>
            </Stack>
          </Box>
        );
      
      case FORM_STEPS.SKETCH:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 4, color: '#2c3e50', fontFamily: '"Playfair Display", serif' }}>
              Add a Sketch (Optional)
            </Typography>
            <SketchSelector
              selectedSketch={selectedSketch}
              onSelect={setSelectedSketch}
            />
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button variant="text" onClick={() => setFormStep(FORM_STEPS.NAME)}>
                Back
              </Button>
              <Button 
                variant="contained"
                onClick={handleSubmitMessage}
                sx={{
                  background: '#3498db',
                  '&:hover': { background: '#2980b9' },
                }}
              >
                Cast Your Message to the Sea
              </Button>
            </Stack>
          </Box>
        );
      
      default:
        return null;
    }
  };

  const advanceState = () => {
    switch (currentState) {
      case STATES.SHOW_SCENE:
        setBottleSpottedMessage(getRandomMessage(NARRATIVE_MESSAGES.BOTTLE_SPOTTED));
        setCurrentState(STATES.SHOW_INITIAL_MESSAGE);
        break;
      case STATES.SHOW_INITIAL_MESSAGE:
        // Instead of showing bottle directly, fetch message first
        setCurrentState(STATES.LOADING);
        fetchRandomMessage();
        break;
      case STATES.SHOW_BOTTLE:
        // Just show the message we already have
        setCurrentState(STATES.SHOW_MESSAGE);
        break;
      case STATES.SHOW_FAMILIAR:
        setCurrentState(STATES.SHOW_MESSAGE);
        break;
      case STATES.SHOW_MESSAGE:
        if (!hasSubmitted) {
          setCurrentState(STATES.SHOW_FORM);
        } else {
          setNewMessageAppearsText(getRandomMessage(NARRATIVE_MESSAGES.NEW_MESSAGE_APPEARS));
          setCurrentState(STATES.SHOW_DISCOVER);
          setTimeout(() => {
            setCurrentState(STATES.LOADING);
            fetchRandomMessage();
          }, 2000);
        }
        break;
      case STATES.SHOW_POST_SUBMIT:
        setNewMessageAppearsText(getRandomMessage(NARRATIVE_MESSAGES.NEW_MESSAGE_APPEARS));
        setCurrentState(STATES.SHOW_DISCOVER);
        setTimeout(() => {
          setCurrentState(STATES.LOADING);
          fetchRandomMessage();
        }, 2000);
        break;
      case STATES.SHOW_DISCOVER:
        setCurrentState(STATES.LOADING);
        fetchRandomMessage();
        break;
      default:
        break;
    }
  };

  const playRandomUnfoldingSound = () => {
    if (!isMuted) {
      const sounds = unfoldingSoundsRef.current;
      const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
      randomSound.volume = 0.3; // Set volume to 30%
      randomSound.currentTime = 0; // Reset sound to start
      randomSound.play().catch(error => {
        console.error('Sound playback failed:', error);
      });
    }
  };

  const playRandomBottleClinkSound = () => {
    if (!isMuted) {
      const sounds = bottleClinkSoundsRef.current;
      const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
      randomSound.volume = 0.3; // Set volume to 30%
      randomSound.currentTime = 0; // Reset sound to start
      randomSound.play().catch(error => {
        console.error('Sound playback failed:', error);
      });
    }
  };

  const handleVolumeToggle = () => {
    const newMutedState = !isMuted;
    if (audioRef.current) {
      audioRef.current.muted = newMutedState;
      unfoldingSoundsRef.current.forEach(sound => {
        sound.muted = newMutedState;
      });
      bottleClinkSoundsRef.current.forEach(sound => {
        sound.muted = newMutedState;
      });
      setIsMuted(newMutedState);
    }
  };

  const getMessageAgeClass = (createdAt) => {
    const daysOld = differenceInDays(new Date(), new Date(createdAt));
    
    if (daysOld < 1) return 'message-new';
    if (daysOld < 2) return 'message-day-old';
    if (daysOld < 3) return 'message-two-days';
    if (daysOld < 5) return 'message-few-days';
    if (daysOld < 8) return 'message-week-old';
    if (daysOld < 13) return 'message-two-weeks';
    if (daysOld < 21) return 'message-three-weeks';
    if (daysOld < 34) return 'message-month-old';
    if (daysOld < 55) return 'message-two-months';
    return 'message-three-months';
  };

  useEffect(() => {
    setCurrentState(STATES.SHOW_SCENE);
  }, []);

  // Add auto-advance from intro scene
  useEffect(() => {
    if (currentState === STATES.SHOW_SCENE) {
      const timer = setTimeout(() => {
        advanceState();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentState]);

  useEffect(() => {
    let timer;
    if (authorLength > 0 && authorLength < MESSAGE_CONSTRAINTS.AUTHOR.MIN_LENGTH) {
      timer = setTimeout(() => setShowAuthorHint(true), 1500);
    } else {
      setShowAuthorHint(false);
    }
    return () => clearTimeout(timer);
  }, [authorLength]);

  useEffect(() => {
    let timer;
    if (contentLength > 0 && contentLength < MESSAGE_CONSTRAINTS.CONTENT.MIN_LENGTH) {
      timer = setTimeout(() => setShowContentHint(true), 1500);
    } else {
      setShowContentHint(false);
    }
    return () => clearTimeout(timer);
  }, [contentLength]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2; // Set volume to 20%
      audioRef.current.loop = true;
      
      // Start playing when the user interacts with the page
      const startAudio = () => {
        audioRef.current.play().catch(error => {
          console.error('Audio playback failed:', error);
        });
        // Remove event listeners after first interaction
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
      };

      document.addEventListener('click', startAudio);
      document.addEventListener('touchstart', startAudio);

      return () => {
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }
  }, []);

  useEffect(() => {
    if (currentState === STATES.SHOW_BOTTLE) {
      playRandomBottleClinkSound();
    }
  }, [currentState]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4,
      }}
    >
      <audio ref={audioRef} src={beachAmbience} preload="auto" />
      <IconButton
        onClick={handleVolumeToggle}
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 1)',
          },
        }}
      >
        {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </IconButton>
      <Container 
        maxWidth="md"
        sx={{
          py: 4,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 8 }}>
          <Box
            component="img"
            src={logo}
            alt="VIBE"
            sx={{
              display: 'block',
              margin: '0 auto',
              mb: 3,
              height: { xs: '40px', md: '60px' },
              width: 'auto',
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography
              variant="h5"
              component="span"
              sx={{
                color: '#34495e',
                fontFamily: '"Playfair Display", serif',
                fontStyle: 'italic',
                display: 'inline',
                position: 'relative',
                lineHeight: 1.5,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: -4,
                  right: -4,
                  top: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.8)',
                  zIndex: -1,
                  transform: 'skew(-2deg)',
                },
              }}
            >
              Coast
            </Typography>
          </Box>
        </Box>

        {/* Main Content Section */}
        <Box 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            minHeight: '400px',
          }}
        >
          {error && (
            <Typography
              color="error"
              align="center"
              sx={{ mb: 2 }}
            >
              {error}
            </Typography>
          )}

          {/* Message Container */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              position: 'relative',
              mb: 8,
            }}
          >
            {/* All message components */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                minHeight: '200px',
              }}
            >
              {/* Scene Setting */}
              <Fade in={currentState === STATES.SHOW_SCENE}>
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  textAlign: 'center'
                }}>
                  <Box sx={{ 
                    display: 'inline-block',
                    textAlign: 'center',
                    width: '100%',
                    '& .highlight-line': {
                      display: 'inline',
                      position: 'relative',
                      lineHeight: 1.7,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        right: -8,
                        top: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.9)',
                        zIndex: -1,
                        transform: 'skew(-2deg)',
                      },
                    }
                  }}>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{
                        color: '#2c3e50',
                        fontFamily: '"Playfair Display", serif',
                        fontStyle: 'italic',
                        textAlign: 'center',
                      }}
                    >
                      {NARRATIVE_MESSAGES.INTRO_SCENE.split(' ').reduce((acc, word, i, arr) => {
                        if (i === 0) return <span className="highlight-line">{word}</span>;
                        return (
                          <>
                            {acc} <span className="highlight-line">{word}</span>
                          </>
                        );
                      }, '')}
                    </Typography>
                  </Box>
                </Box>
              </Fade>

              {/* Initial Message */}
              <Fade in={currentState === STATES.SHOW_INITIAL_MESSAGE}>
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  textAlign: 'center'
                }}>
                  <Box sx={{ 
                    display: 'inline-block',
                    textAlign: 'center',
                    width: '100%',
                    '& .highlight-line': {
                      display: 'inline',
                      position: 'relative',
                      lineHeight: 1.7,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        right: -8,
                        top: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.9)',
                        zIndex: -1,
                        transform: 'skew(-2deg)',
                      },
                    }
                  }}>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{
                        color: '#2c3e50',
                        fontFamily: '"Playfair Display", serif',
                        fontStyle: 'italic',
                        textAlign: 'center',
                      }}
                    >
                      {bottleSpottedMessage.split(' ').reduce((acc, word, i, arr) => {
                        if (i === 0) return <span className="highlight-line">{word}</span>;
                        return (
                          <>
                            {acc} <span className="highlight-line">{word}</span>
                          </>
                        );
                      }, '')}
                    </Typography>
                  </Box>
                </Box>
              </Fade>

              {/* Familiar Message */}
              <Fade in={currentState === STATES.SHOW_FAMILIAR}>
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  textAlign: 'center'
                }}>
                  <Box sx={{ 
                    display: 'inline-block',
                    textAlign: 'center',
                    width: '100%',
                    '& .highlight-line': {
                      display: 'inline',
                      position: 'relative',
                      lineHeight: 1.7,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        right: -8,
                        top: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.9)',
                        zIndex: -1,
                        transform: 'skew(-2deg)',
                      },
                    }
                  }}>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{
                        color: '#2c3e50',
                        fontFamily: '"Playfair Display", serif',
                        fontStyle: 'italic',
                        textAlign: 'center',
                      }}
                    >
                      {familiarMessageText.split(' ').reduce((acc, word, i, arr) => {
                        if (i === 0) return <span className="highlight-line">{word}</span>;
                        return (
                          <>
                            {acc} <span className="highlight-line">{word}</span>
                          </>
                        );
                      }, '')}
                    </Typography>
                  </Box>
                </Box>
              </Fade>

              {/* Discover Message */}
              <Fade in={currentState === STATES.SHOW_DISCOVER}>
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  textAlign: 'center'
                }}>
                  <Box sx={{ 
                    display: 'inline-block',
                    textAlign: 'center',
                    width: '100%',
                    '& .highlight-line': {
                      display: 'inline',
                      position: 'relative',
                      lineHeight: 1.7,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        right: -8,
                        top: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.9)',
                        zIndex: -1,
                        transform: 'skew(-2deg)',
                      },
                    }
                  }}>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{
                        color: '#2c3e50',
                        fontFamily: '"Playfair Display", serif',
                        fontStyle: 'italic',
                        textAlign: 'center',
                      }}
                    >
                      {newMessageAppearsText.split(' ').reduce((acc, word, i, arr) => {
                        if (i === 0) return <span className="highlight-line">{word}</span>;
                        return (
                          <>
                            {acc} <span className="highlight-line">{word}</span>
                          </>
                        );
                      }, '')}
                    </Typography>
                  </Box>
                </Box>
              </Fade>

              {/* Post-Submit Message */}
              <Fade in={currentState === STATES.SHOW_POST_SUBMIT}>
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  textAlign: 'center'
                }}>
                  <Box sx={{ 
                    display: 'inline-block',
                    textAlign: 'center',
                    width: '100%',
                    '& .highlight-line': {
                      display: 'inline',
                      position: 'relative',
                      lineHeight: 1.7,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        right: -8,
                        top: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.9)',
                        zIndex: -1,
                        transform: 'skew(-2deg)',
                      },
                    }
                  }}>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{
                        color: '#2c3e50',
                        fontFamily: '"Playfair Display", serif',
                        fontStyle: 'italic',
                        textAlign: 'center',
                      }}
                    >
                      {messageSentText.split(' ').reduce((acc, word, i, arr) => {
                        if (i === 0) return <span className="highlight-line">{word}</span>;
                        return (
                          <>
                            {acc} <span className="highlight-line">{word}</span>
                          </>
                        );
                      }, '')}
                    </Typography>
                  </Box>
                </Box>
              </Fade>

              {/* Unified Bottle Display */}
              <Fade in={currentState === STATES.SHOW_BOTTLE || currentState === STATES.SHOW_FAMILIAR} timeout={1200}>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    cursor: (currentState === STATES.SHOW_BOTTLE || currentState === STATES.SHOW_FAMILIAR) ? 'pointer' : 'default',
                    '@keyframes slideDown': {
                      'from': {
                        transform: 'translate(-50%, -100px)',
                        opacity: 0
                      },
                      'to': {
                        transform: 'translate(-50%, 0)',
                        opacity: 1
                      }
                    },
                    animation: (currentState === STATES.SHOW_BOTTLE || currentState === STATES.SHOW_FAMILIAR) ? 'slideDown 1.2s ease-out forwards' : 'none'
                  }}
                  onClick={() => {
                    if (currentState === STATES.SHOW_BOTTLE || currentState === STATES.SHOW_FAMILIAR) {
                      playRandomUnfoldingSound();
                      setCurrentState(STATES.SHOW_MESSAGE);
                    }
                  }}
                >
                  {currentMessage && (
                    <img
                      src={bottles[currentBottle - 1]}
                      alt="Bottle"
                      style={{
                        width: '180px',
                        height: '360px',
                        filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
                      }}
                    />
                  )}
                </Box>
              </Fade>

              {/* Message Display */}
              <Fade in={Boolean(currentState === STATES.SHOW_MESSAGE && currentMessage)}>
                <Box sx={{ width: '100%' }}>
                  {currentMessage && (
                    <Paper
                      elevation={3}
                      className={getMessageAgeClass(currentMessage.createdAt)}
                      sx={{
                        position: 'relative',
                        p: 3,
                        maxWidth: '100%',
                        width: '100%',
                        background: '#fff',
                        borderRadius: 2,
                        transform: `rotate(${currentRotation}deg)`,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          pointerEvents: 'none',
                          zIndex: 0,
                        },
                        '&.message-new': {
                          background: '#fff',
                          border: '1px solid #e0e0e0',
                        },
                        '&.message-day-old': {
                          background: '#fffdf5',
                          border: '1px solid #e0e0e0',
                          '&::before': {
                            background: 'linear-gradient(45deg, transparent 98%, #f0f0f0 100%)',
                          },
                        },
                        '&.message-two-days': {
                          background: '#fffaf0',
                          border: '1px solid #e5e5e5',
                          '&::before': {
                            background: `
                              linear-gradient(45deg, transparent 97%, #e8e8e8 100%),
                              linear-gradient(-45deg, transparent 97%, #e8e8e8 100%)
                            `,
                          },
                        },
                        '&.message-few-days': {
                          background: '#fff6e6',
                          border: '1px solid #ddd',
                          '&::before': {
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(222, 184, 135, 0.1) 12px, rgba(222, 184, 135, 0.1) 13px)',
                          },
                        },
                        '&.message-week-old': {
                          background: '#fff2dd',
                          border: '1px solid #ccc',
                          '&::before': {
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(205, 170, 125, 0.15) 10px, rgba(205, 170, 125, 0.15) 11px)',
                          },
                        },
                        '&.message-two-weeks': {
                          background: '#ffecd1',
                          border: '1px solid #bbb',
                          '&::before': {
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(188, 156, 115, 0.2) 8px, rgba(188, 156, 115, 0.2) 9px)',
                          },
                        },
                        '&.message-three-weeks': {
                          background: '#ffe6c2',
                          border: '1px solid #aaa',
                          '&::before': {
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(171, 142, 105, 0.25) 6px, rgba(171, 142, 105, 0.25) 7px)',
                          },
                        },
                        '&.message-month-old': {
                          background: '#ffe0b3',
                          border: '1px solid #999',
                          '&::before': {
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(171, 142, 105, 0.3) 5px, rgba(171, 142, 105, 0.3) 6px)',
                          },
                        },
                        '&.message-two-months': {
                          background: '#ffd9a3',
                          border: '1px solid #888',
                          '&::before': {
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(171, 142, 105, 0.35) 4px, rgba(171, 142, 105, 0.35) 5px)',
                          },
                        },
                        '&.message-three-months': {
                          background: '#ffd199',
                          border: '1px solid #777',
                          '&::before': {
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(171, 142, 105, 0.4) 3px, rgba(171, 142, 105, 0.4) 4px)'
                          }
                        }
                      }}
                      onClick={handleMessageClose}
                    >
                      {/* Algae Spots Layer */}
                      {(() => {
                        const daysSinceCreation = differenceInDays(new Date(), new Date(currentMessage.createdAt));
                        if (currentMessage && daysSinceCreation >= 3) {
                          return getDeterministicSpots(currentMessage._id, daysSinceCreation).map((spot, index) => (
                            <Box
                              key={index}
                              sx={{
                                position: 'absolute',
                                top: `${spot.y}%`,
                                left: `${spot.x}%`,
                                width: `${spot.size}px`,
                                height: `${spot.size}px`,
                                backgroundColor: spot.color,
                                opacity: spot.opacity,
                                borderRadius: '50%',
                                filter: `blur(${spot.blur}px)`,
                                pointerEvents: 'none',
                                zIndex: 1,
                                transform: 'translate(-50%, -50%)'
                              }}
                            />
                          ));
                        }
                        return null;
                      })()}
                      {/* Content Layer */}
                      <Box
                        sx={{
                          position: 'relative',
                          zIndex: 2,
                          width: '100%'
                        }}
                      >
                        <Typography
                          variant="body1"
                          dangerouslySetInnerHTML={{ __html: getSmudgedText(currentMessage.content, currentMessage.createdAt, currentMessage._id) }}
                          sx={{
                            fontFamily: getFontFamily(currentMessage.font),
                            fontSize: '1.25rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'normal',
                            overflowWrap: 'break-word',
                            hyphens: 'none',
                            mb: 2,
                            '& span': {
                              transition: 'filter 0.3s ease-in-out'
                            }
                          }}
                        />
                        <Box 
                          sx={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            width: '100%'
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontFamily: getFontFamily(currentMessage.font),
                                opacity: 0.8
                              }}
                            >
                              {new Date(currentMessage.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                            {currentMessage.sessionId === sessionId && Array.isArray(currentMessage.readBy) && currentMessage.readBy.length > 0 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  fontFamily: getFontFamily(currentMessage.font),
                                  opacity: 0.6,
                                  mt: 0.5
                                }}
                              >
                                {currentMessage.readBy.length} {currentMessage.readBy.length === 1 ? 'person has' : 'people have'} found this message
                              </Typography>
                            )}
                          </Box>
                          {currentMessage.author && currentMessage.author.trim() !== '' && (
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontFamily: getFontFamily(currentMessage.font),
                                fontStyle: 'italic',
                                opacity: 0.8
                              }}
                            >
                              - {currentMessage.author}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      {/* Sketch Layer */}
                      {currentMessage.sketch > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            width: '80px',
                            height: '80px',
                            opacity: 0.15,
                            backgroundImage: `url(${SKETCHES[currentMessage.sketch].icon})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            pointerEvents: 'none',
                            zIndex: 2,
                          }}
                        />
                      )}
                    </Paper>
                  )}
                </Box>
              </Fade>

              {/* Submit Form */}
              <Fade in={currentState === STATES.SHOW_FORM && !hasSubmitted}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(10px)',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '500px',
                    overflow: 'auto',
                    zIndex: 3,
                  }}
                >
                  {renderFormStep()}
                </Paper>
              </Fade>

              {/* Sending Message State */}
              <Fade in={currentState === STATES.SENDING_MESSAGE}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    bottom: 0,
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#2c3e50' }}>
                    {NARRATIVE_MESSAGES.SENDING_MESSAGE}
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Box>

          {/* Continue Button */}
          <Fade in={currentState === STATES.SHOW_INITIAL_MESSAGE || 
                   currentState === STATES.SHOW_MESSAGE || 
                   currentState === STATES.SHOW_FAMILIAR}>
            <Box sx={{ 
              position: 'relative',
              width: '100%',
              textAlign: 'center',
              mt: 4
            }}>
              <Button
                variant="contained"
                onClick={advanceState}
                sx={{
                  background: '#3498db',
                  '&:hover': { background: '#2980b9' },
                  fontSize: '1.1rem',
                  padding: '8px 24px',
                }}
              >
                {currentState === STATES.SHOW_MESSAGE ? 
                  NARRATIVE_MESSAGES.PUT_BACK_BUTTON : 
                  NARRATIVE_MESSAGES.CONTINUE_BUTTON}
              </Button>
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}

export default App; 