export const getSmudgedText = (text, createdAt, messageId) => {
  const age = Date.now() - new Date(createdAt).getTime();
  const daysOld = age / (1000 * 60 * 60 * 24);
  
  // Only apply smudging to messages older than 7 days
  if (daysOld < 7) return text;

  // Use messageId as a seed for deterministic smudging
  const getHashValue = (str, index) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash + index);
  };

  // Split into characters, preserving whitespace
  const chars = text.split('');
  const smudgedChars = chars.map((char, index) => {
    // Don't blur whitespace or punctuation
    if (/\s|[^\w\s]/.test(char)) return char;

    const hash = getHashValue(messageId, index);
    // Use hash to create a more natural random distribution
    const shouldSmudge = (hash % 100) < (daysOld - 7) * 1.5; // Reduced rate of blur increase

    if (!shouldSmudge) return char;

    // Calculate blur amount based on age and position
    const baseBlur = Math.min(Math.floor(daysOld / 21), 1.2); // Max 1.2 base blur, slower progression
    
    // Create more variance in blur amounts
    const hashMod = hash % 100;
    let blurMultiplier;
    if (hashMod < 20) { // 20% chance of very light blur
      blurMultiplier = 0.3;
    } else if (hashMod < 50) { // 30% chance of light blur
      blurMultiplier = 0.6;
    } else if (hashMod < 85) { // 35% chance of medium blur
      blurMultiplier = 1;
    } else { // 15% chance of heavy blur
      blurMultiplier = 1.5;
    }
    
    const blurAmount = baseBlur * blurMultiplier;
    
    // Wrap character in span with blur effect
    return `<span style="filter: blur(${blurAmount}px); display: inline-block;">${char}</span>`;
  });

  return smudgedChars.join('');
}; 