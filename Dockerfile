FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --production

FROM base AS builder
COPY . .

FROM node:20-alpine AS runner
ENV NODE_ENV=production
RUN apk add --no-cache curl
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 8888

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8888/health || exit 1

# Start worker (Railway mode - no initdb)
CMD ["node", "src/workers/index.js"]