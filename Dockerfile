# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/mcp-apps/package*.json ./packages/mcp-apps/
COPY packages/backend/package*.json ./packages/backend/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/shared ./packages/shared
COPY packages/mcp-apps ./packages/mcp-apps
COPY packages/backend ./packages/backend

# Build all packages in order
RUN npm run build:backend

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/mcp-apps/package*.json ./packages/mcp-apps/
COPY packages/backend/package*.json ./packages/backend/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/mcp-apps/dist ./packages/mcp-apps/dist
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "packages/backend/dist/main.js"]
