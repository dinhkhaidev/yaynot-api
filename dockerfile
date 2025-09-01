FROM node:24-alpine3.21 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS builder
COPY . .

FROM node:24-alpine3.21 AS runner
#ENV NODE_ENV=production
#ENV PORT=3000
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app ./
EXPOSE 8888
CMD [ "node", "server.js" ]