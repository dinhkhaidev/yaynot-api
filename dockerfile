FROM node:24-alpine3.21
WORKDIR /app
COPY . .
RUN npm install
CMD [ "node", "server.js" ]