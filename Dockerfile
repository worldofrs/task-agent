# Use the official Node.js LTS image
FROM node:20-slim

# Create app directory inside the container
WORKDIR /app

# Copy package files first (Docker caches this layer so npm install
# only re-runs when dependencies change, not when your code changes)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy the rest of the source code
COPY . .

# Cloud Run sets the PORT env var — your app must listen on it
EXPOSE 3000

# Start the server
CMD ["node", "src/server.js"]
