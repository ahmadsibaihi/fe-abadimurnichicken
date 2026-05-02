FROM nginx:stable-alpine
# Kita copy folder 'build', bukan 'dist'
COPY ./build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
