# Use the official Node.js image
FROM node:20

# Set the working directory
WORKDIR  /home/sooraj/docker-example/frontend

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Expose the port the app runs on
EXPOSE 5173

# Command to run the application
CMD ["npm", "start"]
