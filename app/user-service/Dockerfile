FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY --from=builder /app/index.js ./index.js
COPY --from=builder /app/config ./config
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/model ./model
COPY --from=builder /app/package.json ./package.json

ARG PORT=8002
ENV PORT=${PORT} \
    NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "index.js"]