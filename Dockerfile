# Use the official Node.js image as the base image
FROM node:21

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project files to the working directory
COPY . .

# Expose the port your Node.js app is listening on
EXPOSE 2210
EXPOSE 1772

# Start the Node.js app
CMD ["node", "index.js"]