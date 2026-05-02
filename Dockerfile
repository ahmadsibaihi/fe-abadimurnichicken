# Tahap 1: Build React menggunakan Node.js
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Tahap 2: Jalankan hasil build menggunakan Nginx
FROM nginx:stable-alpine
# PENTING: Jika kamu pakai VITE, foldernya 'dist'. Jika pakai Create-React-App, ganti 'dist' jadi 'build'
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
