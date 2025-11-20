# Multi-stage Dockerfile for InvestLeague

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Backend
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy backend code
COPY server/ ./

# Copy built frontend
COPY --from=frontend-builder /app/client/build ./public

# Create database directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/investleague.db

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
