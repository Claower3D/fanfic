# Build stage
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install build tools for better-sqlite3 compilation
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production runner stage
FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Ensure database directory exists
RUN mkdir -p /app/data

VOLUME ["/app/data"]

EXPOSE 3000

CMD ["node", "server/index.js"]
