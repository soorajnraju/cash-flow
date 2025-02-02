# Use the official Node.js image
FROM node:20

# Set the working directory
WORKDIR /home/sooraj/docker-example/backend

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]
