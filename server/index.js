require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { seedDatabase } = require('./seed');
const Message = require('./models/Message');
const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3011;
const basePath = process.env.BASE_PATH || '/vibe-miab-server';

// Function to get client IP from request
const getClientIp = (req) => {
  let ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress;
           
  // Handle comma-separated IPs (from proxies)
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  // Remove IPv6 prefix if present
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  return ip;
};

// Function to get location data from IP
const getLocationFromIp = async (ip) => {
  if (!ip) return null;
  
  try {
    // Add a timeout to the request
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 5000 // 5 second timeout
    });
    
    if (response.data.status === 'success') {
      return {
        country: response.data.country,
        city: response.data.city,
        region: response.data.regionName,
        latitude: response.data.lat,
        longitude: response.data.lon
      };
    }
    console.warn(`IP location lookup failed for IP ${ip}:`, response.data.message || 'Unknown error');
    return null;
  } catch (error) {
    console.error('Error getting location from IP:', error.message);
    return null;
  }
};

// Function to retry getting location data for a message
const retryGetLocation = async (message) => {
  if (!message.location && message.ipAddress) {
    try {
      const location = await getLocationFromIp(message.ipAddress);
      if (location) {
        message.location = location;
        await message.save();
        return true;
      }
    } catch (error) {
      console.error('Error retrying location fetch:', error.message);
    }
  }
  return false;
};

// Middleware
app.use(cors());
app.use(express.json());

// Create a router for all API routes
const apiRouter = express.Router();

// Root route for testing
apiRouter.get('/', (req, res) => {
  res.json({ message: 'Message in a Bottle API is running' });
});

// Auth routes
apiRouter.use('/auth', authRoutes);

// Public routes
apiRouter.post('/messages', async (req, res) => {
  try {
    const { content, author, bottleStyle, sessionId, font, sketch } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Check if user has already submitted a message
    const existingMessage = await Message.findOne({ sessionId });
    if (existingMessage) {
      return res.status(403).json({ 
        error: 'You have already cast a message into the sea' 
      });
    }

    const ipAddress = getClientIp(req);
    const location = await getLocationFromIp(ipAddress);

    const message = new Message({ 
      content, 
      author, 
      bottleStyle,
      sessionId,
      ipAddress,
      location,
      font: font || 1, // Default to Georgia if not specified
      sketch: sketch || 0, // Default to None if not specified
      status: 'pending'  // Explicitly set status to pending
    });
    
    await message.save();
    
    // Don't send back the ipAddress field
    const responseMessage = message.toObject();
    delete responseMessage.ipAddress;
    
    res.status(201).json(responseMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Error saving message' });
  }
});

apiRouter.get('/messages/random', async (req, res) => {
  try {
    const sessionId = req.query.sessionId;
    const excludeMessageId = req.query.excludeMessageId;
    const previousMessageId = req.query.previousMessageId;
    const forceOwnMessage = req.query.forceOwnMessage === 'true';

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // If forceOwnMessage is true, try to find the user's own message first
    if (forceOwnMessage) {
      const userMessage = await Message.findOne({
        status: 'approved',
        sessionId: sessionId,
        ...(excludeMessageId && excludeMessageId !== 'null' ? { _id: { $ne: excludeMessageId } } : {})
      }).select('-ipAddress');

      if (userMessage) {
        // Only add to readBy if not already there
        if (!userMessage.readBy.includes(sessionId)) {
          userMessage.readBy.push(sessionId);
          await userMessage.save();
        }
        return res.json(userMessage);
      }
    }
    
    // Base query to exclude specific messages and only show approved messages
    const baseQuery = {
      status: 'approved',
      ...(excludeMessageId && excludeMessageId !== 'null' ? { _id: { $ne: excludeMessageId } } : {}),
      ...(previousMessageId && previousMessageId !== 'null' ? { _id: { $ne: previousMessageId } } : {})
    };

    // First, try to find completely unread messages from other users
    const unreadMessages = await Message.find({
      ...baseQuery,
      readBy: { $size: 0 },
      sessionId: { $ne: sessionId }
    }).select('-ipAddress'); // Exclude ipAddress but include all other fields

    if (unreadMessages.length > 0) {
      const randomMessage = unreadMessages[Math.floor(Math.random() * unreadMessages.length)];
      // Only add to readBy if not already there
      if (!randomMessage.readBy.includes(sessionId)) {
        randomMessage.readBy.push(sessionId);
        await randomMessage.save();
      }
      return res.json(randomMessage);
    }

    // If no new messages, find messages from others not read by this session
    const sessionUnreadMessages = await Message.find({
      ...baseQuery,
      readBy: { $ne: sessionId },
      sessionId: { $ne: sessionId }
    }).select('-ipAddress'); // Exclude ipAddress but include all other fields

    if (sessionUnreadMessages.length > 0) {
      const randomMessage = sessionUnreadMessages[Math.floor(Math.random() * sessionUnreadMessages.length)];
      // Only add to readBy if not already there
      if (!randomMessage.readBy.includes(sessionId)) {
        randomMessage.readBy.push(sessionId);
        await randomMessage.save();
      }
      return res.json(randomMessage);
    }

    // If all other messages have been read by this session, find messages weighted by their read count
    const allOtherMessages = await Message.find({
      ...baseQuery,
      sessionId: { $ne: sessionId }
    }).select('-ipAddress'); // Exclude ipAddress but include all other fields

    if (allOtherMessages.length > 0) {
      // Calculate weights based on read counts
      const maxReads = Math.max(...allOtherMessages.map(m => m.readBy.length));
      const weights = allOtherMessages.map(m => {
        // Invert the weight so fewer reads = higher weight
        // Add 1 to avoid division by zero and ensure even unread messages have different weights
        return (maxReads + 1) - m.readBy.length;
      });
      
      // Calculate total weight
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      
      // Generate a random value between 0 and total weight
      let random = Math.random() * totalWeight;
      
      // Select a message based on weights
      let selectedMessage = null;
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          selectedMessage = allOtherMessages[i];
          break;
        }
      }
      
      // Fallback to first message if something went wrong with the weighted selection
      if (!selectedMessage) {
        selectedMessage = allOtherMessages[0];
      }

      // Only add to readBy if not already there
      if (!selectedMessage.readBy.includes(sessionId)) {
        selectedMessage.readBy.push(sessionId);
        await selectedMessage.save();
      }
      return res.json(selectedMessage);
    }

    // If no other messages are available, try to find the user's own message
    const userMessage = await Message.findOne({
      ...baseQuery,
      sessionId: sessionId
    }).select('-ipAddress');

    if (userMessage) {
      // Only add to readBy if not already there
      if (!userMessage.readBy.includes(sessionId)) {
        userMessage.readBy.push(sessionId);
        await userMessage.save();
      }
      return res.json(userMessage);
    }

    return res.status(404).json({ error: 'No messages found' });
  } catch (error) {
    console.error('Error fetching random message:', error);
    res.status(500).json({ error: 'Error fetching random message' });
  }
});

// Protected admin routes
apiRouter.get('/admin/messages/pending', auth, async (req, res) => {
  try {
    const messages = await Message.find({ status: 'pending' })
      .select('-ipAddress')
      .sort({ createdAt: 1 });
    
    // Try to get locations for messages that don't have them
    for (const message of messages) {
      if (!message.location && message.ipAddress) {
        await retryGetLocation(message);
      }
    }
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching pending messages:', error);
    res.status(500).json({ error: 'Error fetching pending messages' });
  }
});

apiRouter.post('/admin/messages/:id/moderate', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const message = await Message.findByIdAndUpdate(
      id,
      { 
        status,
        ...(status === 'approved' ? { approvedBy: req.user.username } : {})
      },
      { new: true }
    ).select('-ipAddress');
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error moderating message:', error);
    res.status(500).json({ error: 'Error moderating message' });
  }
});

// Add new endpoint for deleting messages
apiRouter.delete('/admin/messages/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findByIdAndDelete(id).select('-ipAddress');
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Error deleting message' });
  }
});

// Add endpoint to fetch all messages
apiRouter.get('/admin/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find()
      .select('-ipAddress')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Try to get locations for messages that don't have them
    for (const message of messages) {
      if (!message.location && message.ipAddress) {
        await retryGetLocation(message);
      }
    }
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Mount all API routes under the base path
app.use(basePath + '/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  const status = {
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1,
    messageCount: null
  };

  if (status.mongodb) {
    Message.countDocuments()
      .then(count => {
        status.messageCount = count;
        res.json(status);
      })
      .catch(err => {
        console.error('Error counting messages:', err);
        status.error = 'Error counting messages';
        res.json(status);
      });
  } else {
    res.json(status);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export app for testing
module.exports = app; 