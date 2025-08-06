FROM nginx:alpine

# Copia i tuoi file nella directory che Nginx serve
COPY . /usr/share/nginx/html

# Disabilita la cache aggressiva
RUN sed -i 's/etag off;/etag off;\n    add_header Cache-Control "no-store";/' /etc/nginx/nginx.conf