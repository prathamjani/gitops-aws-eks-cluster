# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force
RUN npm install --include=dev

COPY . .
RUN npm run build

# Serve Stage
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

# Exposed port standard for the frontend service
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
