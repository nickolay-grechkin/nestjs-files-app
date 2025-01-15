FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY ../package*.json ./
COPY ../pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source files
COPY . .

# Build the application
RUN pnpm run build

EXPOSE 3000

# Make sure we're using the production build
CMD ["pnpm", "run", "start:prod"]
