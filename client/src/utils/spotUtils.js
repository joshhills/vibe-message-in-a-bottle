export const getDeterministicSpots = (messageId, age) => {
  const daysOld = age;  // age is already in days
  
  // Only add spots to messages older than 2 days
  if (daysOld < 2) return [];

  // Simple but effective pseudo-random number generator
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Get random number between min and max using seed
  const getRandomRange = (seed, min, max) => {
    return min + Math.floor(seededRandom(seed) * (max - min + 1));
  };

  const spots = [];
  // Increase number of spots based on age
  const numSpots = Math.min(Math.floor(daysOld * 1.5), 15);

  // More natural green colors, no brown
  const colors = [
    'rgba(46, 125, 50, 1)',    // Dark green
    'rgba(56, 142, 60, 1)',    // Medium green
    'rgba(76, 175, 80, 1)',    // Light green
    'rgba(129, 199, 132, 1)',  // Pale green
  ];

  // Convert messageId to a numeric seed
  const baseSeed = messageId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < numSpots; i++) {
    // Generate unique seeds for each property
    const xSeed = baseSeed * (i + 1) * 13.37;
    const ySeed = baseSeed * (i + 1) * 42.73;
    const sizeSeed = baseSeed * (i + 1) * 97.31;
    const colorSeed = baseSeed * (i + 1) * 63.89;
    const opacitySeed = baseSeed * (i + 1) * 28.57;
    const blurSeed = baseSeed * (i + 1) * 71.43;
    
    // Use different prime multipliers for each property to avoid patterns
    const x = getRandomRange(xSeed, 5, 90);
    const y = getRandomRange(ySeed, 5, 90);
    const size = getRandomRange(sizeSeed, 3, 12);
    
    // Opacity increases with age but varies per spot
    const baseOpacity = Math.min(daysOld / 14, 0.6);
    const opacity = baseOpacity * (0.6 + seededRandom(opacitySeed) * 0.4);
    
    const colorIndex = Math.floor(seededRandom(colorSeed) * colors.length);
    const color = colors[colorIndex];
    
    const blur = 0.5 + seededRandom(blurSeed);

    spots.push({
      x,
      y,
      size,
      opacity,
      color,
      blur
    });
  }

  return spots;
}; 