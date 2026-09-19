# Component Vault Production Dockerfile
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptors & install production dependencies
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts || true

# Copy application static files and server
COPY assets/ ./assets/
COPY css/ ./css/
COPY js/ ./js/
COPY index.html 404.html server.js manifest.webmanifest sw.js ./
COPY logo.svg ./

# Expose server port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Run container as unprivileged user
USER node

# Run the Node.js server
CMD ["node", "server.js"]
