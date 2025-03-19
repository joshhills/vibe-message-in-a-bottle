FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install font package explicitly
RUN npm install @fontsource/playfair-display

# Copy the rest of the frontend code
COPY . .

EXPOSE 3000

ENV WDS_SOCKET_PORT=0

CMD ["npm", "start"] 