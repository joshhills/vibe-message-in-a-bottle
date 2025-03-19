const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

// Create initial admin user if none exists
router.post('/setup', async (req, res) => {
  try {
    // Check if setup key matches
    if (req.body.setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(401).json({ error: 'Invalid setup key' });
    }
    
    // Check if any admin exists
    const adminExists = await User.findOne({ isAdmin: true });
    if (adminExists) {
      return res.status(400).json({ error: 'Admin already exists' });
    }
    
    // Create admin user
    const { username, password } = req.body;
    const user = new User({
      username,
      password,
      isAdmin: true
    });
    
    await user.save();
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Error during setup' });
  }
});

module.exports = router; 