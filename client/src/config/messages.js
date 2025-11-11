export const NARRATIVE_MESSAGES = {
  INITIAL_BUTTON: {
    text: "Take a walk along the beach"
  },
  INTRO_SCENE: {
    text: "The waves whisper secrets to the shore, carrying stories from distant lands. Each grain of sand holds a memory, each shell a tale untold.",
    audio: "/vibe-message-in-a-bottle/vo/intro-scene.mp3"
  },
  BOTTLE_SPOTTED: [
    {
      text: "A bottle catches your eye, its glass glinting in the sunlight.",
      audio: "/vibe-message-in-a-bottle/vo/bottle-spotted-1.mp3"
    },
    {
      text: "There, bobbing gently in the waves, a message in a bottle.",
      audio: "/vibe-message-in-a-bottle/vo/bottle-spotted-2.mp3"
    },
    {
      text: "The tide brings forth another secret, wrapped in glass and cork.",
      audio: "/vibe-message-in-a-bottle/vo/bottle-spotted-3.mp3"
    },
    {
      text: "A familiar shape emerges from the surf - a bottle with a message inside.",
      audio: "/vibe-message-in-a-bottle/vo/bottle-spotted-4.mp3"
    },
    {
      text: "The ocean's latest offering: a bottle carrying words from afar.",
      audio: "/vibe-message-in-a-bottle/vo/bottle-spotted-5.mp3"
    }
  ],
  NEW_MESSAGE_APPEARS: [
    {
      text: "The tide brings forth another secret...",
      audio: "/vibe-message-in-a-bottle/vo/new-message-appears-1.mp3"
    },
    {
      text: "Another message washes ashore...",
      audio: "/vibe-message-in-a-bottle/vo/new-message-appears-2.mp3"
    },
    {
      text: "A new bottle appears in the waves...",
      audio: "/vibe-message-in-a-bottle/vo/new-message-appears-3.mp3"
    },
    {
      text: "The ocean offers another story...",
      audio: "/vibe-message-in-a-bottle/vo/new-message-appears-4.mp3"
    }
  ],
  MESSAGE_SENT: [
    {
      text: "Your message has been cast into the sea.",
      audio: "/vibe-message-in-a-bottle/vo/message-sent-1.mp3"
    },
    {
      text: "The bottle drifts away, carrying your words to distant shores.",
      audio: "/vibe-message-in-a-bottle/vo/message-sent-2.mp3"
    },
    {
      text: "Your story joins the ocean's collection of secrets.",
      audio: "/vibe-message-in-a-bottle/vo/message-sent-3.mp3"
    },
    {
      text: "The waves carry your message to new horizons.",
      audio: "/vibe-message-in-a-bottle/vo/message-sent-4.mp3"
    }
  ],
  MESSAGE_PENDING: [
    {
      text: "Your message awaits the tide's approval.",
      audio: "/vibe-message-in-a-bottle/vo/message-pending-1.mp3"
    },
    {
      text: "The ocean holds your words, waiting for the right moment.",
      audio: "/vibe-message-in-a-bottle/vo/message-pending-2.mp3"
    },
    {
      text: "Your bottle floats in the currents, awaiting its journey.",
      audio: "/vibe-message-in-a-bottle/vo/message-pending-3.mp3"
    },
    {
      text: "The waves will carry your message when the time is right.",
      audio: "/vibe-message-in-a-bottle/vo/message-pending-4.mp3"
    }
  ],
  WRITE_FORM_TITLE: {
    text: "Cast Your Message to the Sea"
  },
  WRITE_FORM_NAME_PLACEHOLDER: {
    text: "Your name or pseudonym"
  },
  WRITE_FORM_MESSAGE_PLACEHOLDER: {
    text: "Write your message here..."
  },
  WRITE_FORM_SUBMIT: {
    text: "Cast Your Message"
  },
  WRITE_FORM_SKIP: {
    text: "No, I'll just read messages"
  },
  WRITE_MESSAGE_BUTTON: {
    text: "Write a Message"
  },
  CONTINUE_BUTTON: {
    text: "Continue"
  },
  PUT_BACK_BUTTON: {
    text: "Put back"
  },
  SENDING_MESSAGE: {
    text: "Casting your message to the sea..."
  },
  FAMILIAR_MESSAGE: [
    {
      text: "Hm, this one seems familiar...",
      audio: "/vibe-message-in-a-bottle/vo/familiar-message-1.mp3"
    },
    {
      text: "I think I've seen this message before...",
      audio: "/vibe-message-in-a-bottle/vo/familiar-message-2.mp3"
    },
    {
      text: "This bottle looks familiar...",
      audio: "/vibe-message-in-a-bottle/vo/familiar-message-3.mp3"
    },
    {
      text: "I remember this message from before...",
      audio: "/vibe-message-in-a-bottle/vo/familiar-message-4.mp3"
    }
  ],
  OWN_MESSAGE: [
    {
      text: "Hey, this one's mine!",
      audio: "/vibe-message-in-a-bottle/vo/own-message-1.mp3"
    },
    {
      text: "Oh, I remember writing this!",
      audio: "/vibe-message-in-a-bottle/vo/own-message-2.mp3"
    },
    {
      text: "This is my message!",
      audio: "/vibe-message-in-a-bottle/vo/own-message-3.mp3"
    },
    {
      text: "I wrote this one!",
      audio: "/vibe-message-in-a-bottle/vo/own-message-4.mp3"
    }
  ]
};

export const ERROR_MESSAGES = {
  FETCH_ERROR: {
    text: "The message slipped away... Try again?",
    audio: "/vibe-message-in-a-bottle/vo/fetch-error.mp3"
  },
  SUBMIT_ERROR: {
    text: "Your message couldn't reach the sea. Try again?",
    audio: "/vibe-message-in-a-bottle/vo/submit-error.mp3"
  },
  ALREADY_SUBMITTED: {
    text: "You have already cast a message into the sea",
    audio: "/vibe-message-in-a-bottle/vo/already-submitted.mp3"
  }
};

// Helper function to get text from message object (handles both old string format and new object format)
export const getMessageText = (message) => {
  if (typeof message === 'string') return message;
  if (message && typeof message === 'object' && message.text) return message.text;
  return '';
};

// Helper function to get audio path from message object
export const getMessageAudio = (message) => {
  if (message && typeof message === 'object' && message.audio) return message.audio;
  return null;
}; 