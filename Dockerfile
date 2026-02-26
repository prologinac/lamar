# Use a stable Node image
FROM node:20-slim

# Install system dependencies for WhatsApp/Puppeteer
RUN apt-get update && apt-get install -y \
    ffmpeg \
    webp \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Set the Port
EXPOSE 10000

# Start the bot
CMD ["node", "index.js"]
