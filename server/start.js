require('dotenv').config();
const mongoose = require('mongoose');
const { seedDatabase } = require('./seed');

async function start() {
  try {
    // Connect to MongoDB first
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Run the seed script
    console.log('Running database seed...');
    await seedDatabase();
    
    // Start the server by requiring it
    console.log('Starting server...');
    require('./index');
  } catch (error) {
    console.error('Error during startup:', error);
    process.exit(1);
  }
}

start(); 