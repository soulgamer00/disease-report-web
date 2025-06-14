# frontend/Dockerfile

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set timezone
ENV TZ=Asia/Bangkok
RUN apk add --no-cache tzdata

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Default command (will be overridden in docker-compose)
CMD ["npm", "run", "dev"]