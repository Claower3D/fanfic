FROM node:22-bookworm-slim

WORKDIR /app

# Install native build tools for compiling better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Install npm dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build frontend
COPY . .
RUN npm run build

# Runtime environment settings
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Create data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "server/index.js"]
