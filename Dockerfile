# Dockerfile para servir aplicación estática con Nginx
FROM nginx:alpine

# Copiar archivos de la aplicación al directorio de nginx
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY config.js /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Script para configurar nginx con el puerto dinámico
RUN echo '#!/bin/sh\n\
PORT=${PORT:-80}\n\
echo "server {\n\
    listen $PORT;\n\
    listen [::]:$PORT;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    location / {\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
    \n\
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\n\
        expires 1y;\n\
        add_header Cache-Control \"public, immutable\";\n\
    }\n\
}" > /etc/nginx/conf.d/default.conf\n\
\n\
echo "Starting nginx on port $PORT"\n\
nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

# Exponer puerto 80 por defecto (Coolify lo sobreescribirá)
EXPOSE 80

# Usar el script de inicio
CMD ["/start.sh"]