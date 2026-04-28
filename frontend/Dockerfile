# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force
RUN npm install --include=dev

COPY . .
RUN npm run build

# Serve Stage (NGINX Reverse Proxy)
FROM nginxinc/nginx-unprivileged:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom NGINX routing configuration seamlessly
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
