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

# Build the app (make sure this outputs to 'dist')
RUN npm run build

# Install a lightweight HTTP server to serve the build
RUN npm install -g serve

# Create a serve.json file for custom headers (including CORS)
RUN echo '{ \
  "headers": [{ \
    "source": "**", \
    "headers": [{ "key": "Access-Control-Allow-Origin", "value": "*" }, \
                { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" }, \
                { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }] \
  }] \
}' > serve.json

# Expose the correct port
EXPOSE 3000

# Command to serve the app with CORS enabled
CMD ["serve", "-s", "dist", "-l", "3000", "--config", "serve.json"]
