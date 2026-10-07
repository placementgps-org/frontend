FROM node:20-bookworm

# Install Python and Java
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

# Map python to python3 if python doesn't exist
RUN ln -s /usr/bin/python3 /usr/bin/python || true

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port (Render sets process.env.PORT)
EXPOSE 5005

# Start the application
CMD ["npm", "start"]
