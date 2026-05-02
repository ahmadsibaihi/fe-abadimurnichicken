# Gunakan versi Full agar lebih stabil saat install
FROM node:18 as build-stage
WORKDIR /app
COPY package*.json ./

# Tambahkan flag legacy agar tidak bentrok library
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Tahap Nginx tetap pakai alpine biar ringan
FROM nginx:stable-alpine
# SESUAIKAN: ganti /dist menjadi /build jika kamu TIDAK pakai Vite
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
