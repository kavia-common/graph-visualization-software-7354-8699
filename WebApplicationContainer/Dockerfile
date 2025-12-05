# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Serve stage with Caddy
FROM caddy:2.7-alpine
# Create non-root user
RUN addgroup -S web && adduser -S web -G web
USER web
COPY --from=build /app/build /srv
COPY Caddyfile /etc/caddy/Caddyfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://localhost:3000/ || exit 1
