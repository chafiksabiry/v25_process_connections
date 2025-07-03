# Use a lightweight Node.js base image
FROM node:20-alpine
# Install curl
RUN apk add --no-cache curl

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set default environment variable
ENV VITE_ENVIRONMENT=sandbox

# Build the app (make sure this outputs to 'dist')
RUN npm run build

# Install a lightweight HTTP server to serve the build
RUN npm install -g serve

# Expose the correct port
EXPOSE 3000

# Command to serve the app and make it accessible
CMD ["serve", "-s", "dist","-l","3000"]
