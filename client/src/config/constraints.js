export const MESSAGE_CONSTRAINTS = {
  CONTENT: {
    MAX_LENGTH: 1000,
    MIN_LENGTH: 10,
  },
  AUTHOR: {
    MAX_LENGTH: 50,
    MIN_LENGTH: 2,
  },
  MESSAGE_DISPLAY: {
    SHOW_OWN_MESSAGE_EVERY: 6, // Show user's own message every N messages
  }
};

export const DISPLAY_SETTINGS = {
  MESSAGE: {
    MAX_WIDTH_CHARS: 80, // Approximate characters per line for readability
    LINE_HEIGHT: 1.8,
    FONT_SIZE: '1.1rem',
  },
  FORM: {
    TEXTAREA_ROWS: 6,
  }
}; 