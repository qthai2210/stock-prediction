# Base image with Node.js (using Debian-based image for better Python support)
FROM node:20-bookworm-slim

# Install system dependencies for Python and build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set up work directory
WORKDIR /app

# --- Python / AI Setup ---
# Create virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy AI requirements and install
COPY ai/requirements-training.txt ./ai/requirements-training.txt
RUN pip3 install --no-cache-dir -r ai/requirements-training.txt

# Copy AI source code
COPY ai ./ai

# --- Backend / NestJS Setup ---
# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci

# Copy backend source code
COPY backend ./

# Build the NestJS application
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the NestJS application
CMD ["npm", "run", "start:prod"]
