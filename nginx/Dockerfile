FROM nginx:alpine

RUN apk update && apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/anteiku.key \
    -out /etc/nginx/ssl/anteiku.crt \
    -subj "/C=DE/ST=LowerSaxony/L=Wolfsburg/O=42/OU=Student/CN=localhost"

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443 5601 9200

CMD ["nginx", "-g", "daemon off;"]