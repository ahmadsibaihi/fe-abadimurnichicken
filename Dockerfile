# ==========================================
# STAGE 1: Build React (compile source code)
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy file package.json dan package-lock.json (kalau ada)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install

# Copy seluruh source code
COPY . .

# Build React (output akan masuk ke folder /app/build)
RUN npm run build

# ==========================================
# STAGE 2: Nginx serving static files
# ==========================================
FROM nginx:stable-alpine

# Copy hasil build dari stage 1 ke direktori nginx
COPY --from=builder /app/build /usr/share/nginx/html

# (Opsional) Kalau ada custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]