export const getFontFamily = (fontId) => {
  switch (fontId) {
    case 1:
      return '"Playfair Display", serif';
    case 2:
      return '"Cormorant Garamond", serif';
    case 3:
      return '"Libre Baskerville", serif';
    case 4:
      return '"Crimson Text", serif';
    case 5:
      return '"Lora", serif';
    case 6:
      return '"Merriweather", serif';
    case 7:
      return '"Source Serif Pro", serif';
    case 8:
      return '"EB Garamond", serif';
    case 9:
      return '"Crimson Pro", serif';
    case 10:
      return '"Fraunces", serif';
    default:
      return '"Playfair Display", serif';
  }
}; 