# Message in a Bottle

A web application for collecting messages in a bottle, themed around coastal towns and beach photography.

## Features

- Beautiful coastal-themed UI
- Message submission form
- Responsive design
- Real-time message storage

## Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Create a `.env` file in the root directory with:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3001
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Production Deployment

1. Build the frontend:
```bash
cd client && npm run build
```

2. Start the production server:
```bash
npm start
``` 