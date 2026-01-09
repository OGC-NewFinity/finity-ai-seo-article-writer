FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Verify critical dependencies are installed (using import for ES modules)
RUN node --input-type=module -e "import('@google/generative-ai').then(() => console.log('✅ @google/generative-ai verified')).catch(() => { console.error('❌ ERROR: @google/generative-ai not found!'); process.exit(1); })"

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
ENTRYPOINT ["/entrypoint.sh"]
