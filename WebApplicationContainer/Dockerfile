# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Serve stage with Caddy
FROM caddy:2.7-alpine
COPY --from=build /app/build /srv
COPY Caddyfile /etc/caddy/Caddyfile
