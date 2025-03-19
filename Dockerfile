FROM node:18-alpine

WORKDIR /app

# Install nodemon globally
RUN npm install -g nodemon

# Copy server files including its package.json
COPY server/ ./

# Install dependencies
RUN npm install

EXPOSE 3001

# Run with nodemon watching both the script and server files
CMD ["nodemon", "start.js"] 