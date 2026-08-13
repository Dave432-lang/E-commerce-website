FROM node:20-alpine

WORKDIR /app

# Copy package definition files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy server code
COPY . .

# Expose backend API port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
