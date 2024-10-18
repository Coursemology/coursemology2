# Use Node.js 18.17 as the base image
FROM node:18.17-alpine

# Install Python, make, and g++
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev giflib-dev

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to install dependencies
COPY package.json yarn.lock ./

# Copy the rest of the client code
COPY . .

# Build the React client for development
CMD ["yarn && yarn build:development"]
