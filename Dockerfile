FROM nginx:stable-alpine
# Kita langsung copy folder dist yang sudah kamu build di Mac tadi
COPY ./dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
