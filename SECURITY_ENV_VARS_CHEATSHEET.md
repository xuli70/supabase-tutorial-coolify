# 🔐 CHULETA DE SEGURIDAD: Variables de Entorno en Coolify

Esta guía explica cómo proteger credenciales y secretos en aplicaciones desplegadas con Coolify.

## 🚨 El Problema: Credenciales Expuestas

**NUNCA hagas esto:**
```javascript
// ❌ MAL - Credenciales hardcodeadas
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'miPasswordSecreta';
```

**Riesgos:**
- 📢 Cualquiera puede ver tus credenciales en GitHub
- 💸 Pueden usar tus servicios y generar costos
- 🔓 Acceso no autorizado a tus datos
- 🚫 Imposible rotar credenciales sin cambiar código

## ✅ La Solución: Variables de Entorno

### 1. **Estructura de archivos necesarios**

```
proyecto/
├── index.html       # Carga env.js primero
├── config.js        # Lee variables de window.ENV
├── entrypoint.sh    # Script que inyecta variables
├── Dockerfile       # Ejecuta entrypoint.sh
├── .env.example     # Ejemplo SIN credenciales reales
└── .gitignore       # Ignora archivos .env
```

### 2. **config.js - Configuración dinámica**

```javascript
// ✅ BIEN - Lee variables del entorno
const CONFIG = {
    // Intenta leer de window.ENV, si no existe usa placeholder
    apiUrl: window.ENV?.API_URL || 'https://configurar-en-coolify',
    apiKey: window.ENV?.API_KEY || 'configurar-en-coolify',
    dbHost: window.ENV?.DB_HOST || 'localhost'
};

// Validar que estén configuradas
if (!window.ENV?.API_KEY) {
    console.error('⚠️ Variables de entorno no configuradas');
    // Mostrar mensaje al usuario
}
```

### 3. **entrypoint.sh - Script de inyección**

```bash
#!/bin/sh
# Script para inyectar variables de entorno en la aplicación

# Crear archivo env.js con las variables
cat > /app/env.js << EOF
// Variables de entorno inyectadas por Coolify
window.ENV = {
    API_URL: "${API_URL}",
    API_KEY: "${API_KEY}",
    DB_HOST: "${DB_HOST}",
    // Agregar todas las variables que necesites
};
EOF

echo "✅ Variables de entorno inyectadas"

# Iniciar el servidor (Caddy, nginx, etc)
exec caddy run --config /app/Caddyfile --adapter caddyfile
```

### 4. **index.html - Cargar variables primero**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mi App</title>
</head>
<body>
    <!-- Cargar variables de entorno PRIMERO -->
    <script src="env.js"></script>
    
    <!-- Luego cargar configuración y app -->
    <script src="config.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### 5. **Dockerfile - Usar el script**

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Instalar servidor web
RUN apk add --no-cache caddy

# Copiar archivos
COPY . .

# Hacer ejecutable el script
RUN chmod +x /app/entrypoint.sh

# Crear configuración de Caddy
RUN echo -e ":${PORT:-8080} {\n\
    root * /app\n\
    file_server\n\
    try_files {path} /index.html\n\
}" > /app/Caddyfile

EXPOSE 8080

# Usar el script que inyecta variables
CMD ["/app/entrypoint.sh"]
```

### 6. **.env.example - Documentación**

```bash
# Ejemplo de variables necesarias
# NO pongas valores reales aquí
API_URL=https://tu-api.com
API_KEY=tu-api-key-aqui
DB_HOST=tu-servidor-db
DB_PASSWORD=tu-password-aqui

# Este archivo es solo referencia
# Configura las variables reales en Coolify
```

### 7. **.gitignore - Seguridad extra**

```
# Ignorar archivos con credenciales
.env
.env.local
.env.production
env.js
*.pem
*.key
```

## 🚀 Configuración en Coolify

### 1. En el panel de Coolify:
- Ve a tu aplicación
- Sección "Environment Variables"
- Agrega las variables:
  ```
  API_URL=https://mi-api-real.com
  API_KEY=sk-abc123def456
  DB_PASSWORD=miPasswordSeguro
  ```

### 2. Formato correcto:
- ✅ `VARIABLE=valor`
- ❌ `VARIABLE="valor"` (sin comillas)
- ❌ `VARIABLE = valor` (sin espacios)

### 3. Deploy:
- Guardar cambios
- Redeploy la aplicación

## 🛡️ Validación y manejo de errores

```javascript
// Función para verificar configuración
function verificarConfiguracion() {
    const requiredVars = ['API_KEY', 'API_URL'];
    const missing = [];
    
    requiredVars.forEach(varName => {
        if (!window.ENV?.[varName]) {
            missing.push(varName);
        }
    });
    
    if (missing.length > 0) {
        console.error('Variables faltantes:', missing);
        mostrarError('Configuración incompleta. Contacta al administrador.');
        return false;
    }
    
    return true;
}

// Usar antes de operaciones críticas
if (!verificarConfiguracion()) {
    return;
}
```

## 📋 Checklist de seguridad

- [ ] ¿Eliminaste TODAS las credenciales del código?
- [ ] ¿Creaste el archivo .env.example sin valores reales?
- [ ] ¿El .gitignore incluye archivos sensibles?
- [ ] ¿Validaste que las variables existan antes de usarlas?
- [ ] ¿Mostraste mensajes de error claros al usuario?
- [ ] ¿Documentaste qué variables son necesarias?
- [ ] ¿Rotaste las credenciales que estuvieron expuestas?

## 🔄 Proceso para migrar proyecto existente

1. **Identificar credenciales**
   ```bash
   # Buscar posibles credenciales
   grep -r "api_key\|password\|secret\|token" --include="*.js" .
   ```

2. **Reemplazar con variables**
   ```javascript
   // Antes
   const API_KEY = 'sk-12345';
   
   // Después  
   const API_KEY = window.ENV?.API_KEY || 'configurar-en-coolify';
   ```

3. **Crear script de inyección**
   - Copiar entrypoint.sh
   - Agregar todas las variables necesarias

4. **Actualizar Dockerfile**
   - Usar el script como CMD

5. **Configurar en Coolify**
   - Agregar todas las variables
   - Redeploy

## 🚀 Plantilla rápida

```bash
# 1. Crear estructura
touch entrypoint.sh .env.example
chmod +x entrypoint.sh

# 2. Copiar plantillas de esta guía

# 3. Reemplazar credenciales en código
# Buscar: 'tu-credencial-hardcodeada'
# Reemplazar: window.ENV?.NOMBRE_VARIABLE

# 4. Commit y push
git add .
git commit -m "Securizar aplicación con variables de entorno"
git push

# 5. Configurar en Coolify
```

## ⚡ Tips avanzados

### Variables con JSON
```javascript
// Para configuraciones complejas
const dbConfig = JSON.parse(window.ENV?.DB_CONFIG || '{}');
```

### Variables booleanas
```javascript
// Convertir string a boolean
const debugMode = window.ENV?.DEBUG === 'true';
```

### URLs dinámicas
```javascript
// Construir URLs basadas en entorno
const apiEndpoint = `${window.ENV?.API_BASE_URL}/v1/endpoint`;
```

## 🆘 Solución de problemas

### "Variables no definidas"
- Verificar que env.js se carga ANTES que otros scripts
- Comprobar que el entrypoint.sh se ejecuta
- Revisar logs de Coolify

### "Permission denied" 
- Asegurar que entrypoint.sh sea ejecutable
- `RUN chmod +x /app/entrypoint.sh` en Dockerfile

### Variables no se actualizan
- Siempre hacer redeploy después de cambiar variables
- Limpiar caché del navegador

---

**Creado para**: Proyectos con Coolify
**Última actualización**: Junio 2025
**Autor**: xuli70