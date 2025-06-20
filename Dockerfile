# Dockerfile para Coolify con Caddy
FROM node:18-alpine

WORKDIR /app

# Instalar caddy para servir archivos estáticos
RUN apk add --no-cache caddy

# Copiar todos los archivos de la aplicación
COPY index.html ./
COPY styles.css ./
COPY config.js ./
COPY app.js ./

# Crear Caddyfile para servir la aplicación
RUN echo -e ":${PORT:-8080} {\n\
    root * /app\n\
    file_server\n\
    try_files {path} /index.html\n\
}" > /app/Caddyfile

# Exponer el puerto 8080
EXPOSE 8080

# Comando para iniciar Caddy
CMD ["caddy", "run", "--config", "/app/Caddyfile", "--adapter", "caddyfile"]