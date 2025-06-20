# Dockerfile para aplicación segura con variables de entorno
FROM node:18-alpine

WORKDIR /app

# Instalar caddy
RUN apk add --no-cache caddy

# Copiar archivos estáticos
COPY index.html ./
COPY styles.css ./
COPY config.js ./
COPY app.js ./
COPY entrypoint.sh ./

# Hacer ejecutable el script
RUN chmod +x /app/entrypoint.sh

# Crear Caddyfile
RUN echo -e ":${PORT:-8080} {\n\
    root * /app\n\
    file_server\n\
    try_files {path} /index.html\n\
}" > /app/Caddyfile

EXPOSE 8080

# Usar el script de entrypoint que inyecta las variables
CMD ["/app/entrypoint.sh"]