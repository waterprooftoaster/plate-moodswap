# Base image with Node.js
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the development port
EXPOSE 3000

# Start the dev server
CMD ["npm", "run", "dev"]