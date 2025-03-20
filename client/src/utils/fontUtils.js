export const getFontFamily = (fontId) => {
  switch (fontId) {
    case 1:
      return '"Georgia", serif';
    case 2:
      return '"Roboto", sans-serif';
    case 3:
      return '"JetBrains Mono", monospace';
    case 4:
      return '"Indie Flower", cursive';
    default:
      return '"Georgia", serif';
  }
}; 