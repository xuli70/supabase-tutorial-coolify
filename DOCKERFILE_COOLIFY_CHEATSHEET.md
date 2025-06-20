# 📋 CHULETA DOCKERFILE PARA COOLIFY

Esta guía te ayudará a crear Dockerfiles compatibles con Coolify para diferentes tipos de aplicaciones.

## 🔑 Reglas Fundamentales para Coolify

1. **SIEMPRE usar puerto 8080** - Coolify espera este puerto por defecto
2. **Usar Caddy como servidor** - Más compatible que nginx con Coolify
3. **La variable PORT debe ser dinámica**: `${PORT:-8080}`
4. **Health checks** apuntan al puerto 8080

---

## 📦 1. APLICACIONES ESTÁTICAS (HTML/CSS/JS)

```dockerfile
# Dockerfile para aplicación estática
FROM node:18-alpine

WORKDIR /app

# Instalar caddy
RUN apk add --no-cache caddy

# Copiar archivos estáticos
COPY index.html ./
COPY style.css ./
COPY script.js ./
# Copiar todos los archivos que necesites...

# Crear Caddyfile
RUN echo -e ":${PORT:-8080} {\n\
    root * /app\n\
    file_server\n\
    try_files {path} /index.html\n\
}" > /app/Caddyfile

EXPOSE 8080

CMD ["caddy", "run", "--config", "/app/Caddyfile", "--adapter", "caddyfile"]
```

---

## ⚛️ 2. APLICACIONES REACT/VITE

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Instalar caddy
RUN apk add --no-cache caddy

# Copiar build desde stage anterior
COPY --from=builder /app/dist ./dist

# Crear Caddyfile
RUN echo -e ":${PORT:-8080} {\n\
    root * /app/dist\n\
    file_server\n\
    try_files {path} /index.html\n\
}" > /app/Caddyfile

EXPOSE 8080

CMD ["caddy", "run", "--config", "/app/Caddyfile", "--adapter", "caddyfile"]
```

---

## 🟢 3. APLICACIONES NODE.JS/EXPRESS

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código
COPY . .

# IMPORTANTE: Tu app debe escuchar en process.env.PORT || 8080
EXPOSE 8080

CMD ["node", "server.js"]
```

**⚠️ En tu código Node.js:**
```javascript
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🎯 4. APLICACIONES NEXT.JS

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copiar archivos necesarios
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

# Next.js necesita el puerto en variable de entorno
ENV PORT=8080

CMD ["npm", "start"]
```

---

## 🐍 5. APLICACIONES PYTHON/FLASK

```dockerfile
FROM python:3.11-alpine

WORKDIR /app

# Instalar dependencias del sistema si necesitas
RUN apk add --no-cache gcc musl-dev

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

EXPOSE 8080

# Gunicorn escuchando en puerto 8080
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
```

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### Error 502 Bad Gateway
- **Causa**: Puerto incorrecto
- **Solución**: Asegúrate de usar puerto 8080

### Build falla con "file not found"
- **Causa**: Archivo no existe o está en .dockerignore
- **Solución**: Verifica que el archivo exista y no esté ignorado

### La app no responde
- **Causa**: No está escuchando en 0.0.0.0
- **Solución**: Configura tu app para escuchar en todas las interfaces

### Health check falla
- **Causa**: Path o puerto incorrecto
- **Solución**: Health check path: `/`, port: `8080`

---

## 📝 CHECKLIST ANTES DE DEPLOYAR

- [ ] ¿El Dockerfile usa puerto 8080?
- [ ] ¿Usas Caddy para archivos estáticos?
- [ ] ¿La variable PORT es dinámica `${PORT:-8080}`?
- [ ] ¿El EXPOSE está en 8080?
- [ ] ¿Tu app escucha en 0.0.0.0 y no en localhost?
- [ ] ¿El health check apunta a puerto 8080?
- [ ] ¿Todos los archivos necesarios se copian?

---

## 🛠️ CONFIGURACIÓN EN COOLIFY

1. **General Settings**:
   - Port: `8080`
   - Build Pack: `Dockerfile`

2. **Health Check** (opcional):
   - Path: `/`
   - Port: `8080`
   - Interval: `30`

3. **Environment Variables** (si necesitas):
   - No toques PORT, Coolify la gestiona

---

## 💡 TIPS ADICIONALES

1. **Para debugging**, agrega logs al inicio:
   ```dockerfile
   CMD echo "Starting server on port ${PORT:-8080}" && \
       ["tu-comando-aquí"]
   ```

2. **Si necesitas HTTPS**, Coolify lo maneja automáticamente con el dominio

3. **Para apps con base de datos**, usa las variables de entorno de Coolify

4. **Siempre usa Alpine Linux** cuando sea posible (más ligero)

5. **Multi-stage builds** para apps que necesitan compilación

---

## 📚 PLANTILLA RÁPIDA - COPIA Y PEGA

```dockerfile
# === PLANTILLA BÁSICA PARA COOLIFY ===
FROM node:18-alpine
WORKDIR /app

# Instalar lo que necesites (caddy para estáticos)
RUN apk add --no-cache caddy

# Copiar archivos
COPY . .

# Configurar servidor (ajusta según tu app)
RUN echo -e ":${PORT:-8080} {\n\
    root * /app\n\
    file_server\n\
    try_files {path} /index.html\n\
}" > /app/Caddyfile

# SIEMPRE puerto 8080
EXPOSE 8080

# Comando de inicio
CMD ["caddy", "run", "--config", "/app/Caddyfile", "--adapter", "caddyfile"]
```

---

**Creado para**: Coolify en VPS Hostinger
**Autor**: xuli70
**Última actualización**: Junio 2025