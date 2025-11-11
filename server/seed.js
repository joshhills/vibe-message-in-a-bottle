require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message');
const { v4: uuidv4 } = require('uuid');
const { subDays, subHours } = require('date-fns');

// Get a date in the past based on the number of days
const getDateInPast = (daysAgo) => {
  // Add random hours to make it more realistic
  const randomHours = Math.floor(Math.random() * 12);
  return subHours(subDays(new Date(), daysAgo), randomHours);
};

// Example messages with a coastal/beach theme
const exampleMessages = [
  {
    content: "The lighthouse stands tall, a beacon of hope in the storm. Its light reaches across the waves, guiding lost souls home.",
    author: "A Keeper",
    sessionId: uuidv4(),
    status: "approved",
    bottleStyle: 1,
    font: 1, // Georgia
    sketch: 3, // Crown
    createdAt: getDateInPast(0), // New message (today)
  },
  {
    content: "Seashells whisper ancient tales of distant shores, each one a fragment of ocean memory carried by the tides.",
    author: "Beach Walker",
    sessionId: uuidv4(),
    status: "approved",
    bottleStyle: 2,
    font: 2, // Playfair Display
    sketch: 0, // None
    createdAt: getDateInPast(1), // 1 day old
  },
  {
    content: "Footprints in the sand, temporary marks of our passage, soon to be washed away by the eternal dance of waves.",
    author: "Coastal Poet",
    sessionId: uuidv4(),
    status: "approved",
    bottleStyle: 3,
    font: 3, // Crimson Text
    sketch: 4, // Balloon
    createdAt: getDateInPast(2), // 2 days old
  },
  {
    content: "The sea breeze carries stories from distant lands, tales of adventure and discovery that make my heart yearn for the horizon.",
    author: "Wind Listener",
    sessionId: uuidv4(),
    status: "approved",
    bottleStyle: 4,
    font: 4, // Lora
    sketch: 2, // Cat
    createdAt: getDateInPast(4), // Few days old (4 days)
  },
  {
    content: "Watching the sunset paint the ocean in gold and crimson, I realize that every day ends in a masterpiece.",
    author: "Sunset Gazer",
    sessionId: uuidv4(),
    status: "approved",
    bottleStyle: 5,
    font: 1,
    sketch: 1, // Heart
    createdAt: getDateInPast(7), // Week old
  },
  {
    content: "The rhythm of the waves matches the beating of my heart. In this moment, I am one with the ocean's endless song.",
    author: "Wave Dancer",
    sessionId: uuidv4(),
    status: "approved",
    bottleStyle: 1,
    font: 2,
    sketch: 1, // Heart
    createdAt: getDateInPast(12), // Two weeks old
  },
  {
    content: "Standing at the edge of the continent, I feel small yet connected to something vast and ancient. The ocean holds secrets older than time.",
    author: "Ocean Dreamer",
    sessionId: uuidv4(),
    status: "approved",
    bottleStyle: 2,
    font: 3,
    sketch: 3, // Crown
    createdAt: getDateInPast(20), // Three weeks old
  },
  {
    content: "Each wave that crashes on the shore brings a message from the deep. Today, the ocean speaks of patience and persistence.",
    author: "Tide Watcher",
    sessionId: uuidv4(),
    status: "approved",
    bottleStyle: 3,
    font: 4,
    sketch: 2, // Cat
    createdAt: getDateInPast(33), // Month old
  },
  {
    content: "In the depths of winter, I found an invincible summer within me. The beach reminds me that change is constant, yet beauty remains.",
    author: "Season Keeper",
    sessionId: uuidv4(),
    status: "approved",
    bottleStyle: 4,
    font: 1,
    sketch: 4, // Balloon
    createdAt: getDateInPast(54), // Two months old
  },
  {
    content: "Time flows like the tide, leaving treasures in its wake. Some days we find shells, other days we find wisdom.",
    author: "Time Collector",
    sessionId: uuidv4(),
    status: "approved",
    bottleStyle: 5,
    font: 2,
    sketch: 0, // None
    createdAt: getDateInPast(89), // Three months old
  },
];

const seedDatabase = async () => {
  try {
    // Check if database is empty
    const messageCount = await Message.countDocuments();
    
    if (messageCount === 0) {
      console.log('Database is empty, seeding initial messages...');
      // Insert new messages
      const messages = await Message.insertMany(exampleMessages);
      console.log(`Seeded ${messages.length} messages`);
    } else {
      console.log(`Database already contains ${messageCount} messages, skipping seed`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => seedDatabase())
    .then(() => mongoose.connection.close())
    .then(() => console.log('Database connection closed'))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, exampleMessages }; 