# 🚀 CHULETA: Conectar App con Supabase en VPS + Coolify

Guía completa para desplegar aplicaciones que se conectan a Supabase usando Coolify en VPS Hostinger.

## 📋 Arquitectura del Sistema

```
┌─────────────────┐     HTTPS      ┌──────────────────┐
│   Tu Dominio    │ ──────────────> │   Coolify VPS    │
│ app.ejemplo.com │                 │   (Hostinger)    │
└─────────────────┘                 └────────┬─────────┘
                                             │
                                             │ API Calls
                                             ▼
                                    ┌──────────────────┐
                                    │    Supabase      │
                                    │ stik.axcsol.com  │
                                    └──────────────────┘
```

## 🔧 Requisitos Previos

1. **VPS Hostinger** con Coolify instalado
2. **Supabase** desplegado (puede ser en el mismo VPS o externo)
3. **Dominio** configurado apuntando al VPS
4. **GitHub** para el código fuente

## 📁 Estructura del Proyecto

```
mi-app-supabase/
├── index.html          # Punto de entrada
├── config.js           # Configuración de Supabase
├── app.js              # Lógica de la aplicación
├── styles.css          # Estilos
├── entrypoint.sh       # Script para inyectar variables
├── Dockerfile          # Configuración Docker
├── .env.example        # Ejemplo de variables
├── .dockerignore       # Archivos a ignorar
└── README.md           # Documentación
```

## 🐳 Dockerfile Optimizado para Coolify

```dockerfile
# Dockerfile para app estática con Supabase
FROM node:18-alpine

WORKDIR /app

# Instalar Caddy (servidor web compatible con Coolify)
RUN apk add --no-cache caddy

# Copiar archivos de la aplicación
COPY index.html ./
COPY styles.css ./
COPY config.js ./
COPY app.js ./
COPY entrypoint.sh ./

# Hacer ejecutable el script
RUN chmod +x /app/entrypoint.sh

# Crear Caddyfile con puerto 8080 (IMPORTANTE para Coolify)
RUN echo -e ":${PORT:-8080} {\n\
    root * /app\n\
    file_server\n\
    try_files {path} /index.html\n\
    # CORS headers para Supabase\n\
    header {\n\
        Access-Control-Allow-Origin *\n\
        Access-Control-Allow-Methods GET,POST,PUT,DELETE,OPTIONS\n\
        Access-Control-Allow-Headers *\n\
    }\n\
}" > /app/Caddyfile

# Puerto 8080 es el estándar de Coolify
EXPOSE 8080

# Ejecutar script que inyecta variables
CMD ["/app/entrypoint.sh"]
```

## 🔐 Script de Variables (entrypoint.sh)

```bash
#!/bin/sh
# Script para inyectar variables de Supabase

# Crear archivo env.js con las variables de entorno
cat > /app/env.js << EOF
// Variables de Supabase inyectadas por Coolify
window.ENV = {
    // URL de tu instancia Supabase
    SUPABASE_URL: "${SUPABASE_URL}",
    
    // API Key pública (anon key)
    SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}",
    
    // Opcional: Service Role Key (solo si es necesaria)
    SUPABASE_SERVICE_KEY: "${SUPABASE_SERVICE_KEY}"
};
EOF

echo "✅ Variables de Supabase configuradas"

# Iniciar Caddy en puerto 8080
exec caddy run --config /app/Caddyfile --adapter caddyfile
```

## 🔑 Configuración de Supabase (config.js)

```javascript
// Configuración segura de Supabase
const SUPABASE_CONFIG = {
    // URL base - NO hardcodear
    url: window.ENV?.SUPABASE_URL || 'https://configurar-en-coolify',
    
    // Anon Key - NO hardcodear
    anonKey: window.ENV?.SUPABASE_ANON_KEY || 'configurar-en-coolify',
    
    // Configuración de la API
    headers: {
        'apikey': window.ENV?.SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${window.ENV?.SUPABASE_ANON_KEY || ''}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
};

// Validar configuración
if (!window.ENV?.SUPABASE_URL || !window.ENV?.SUPABASE_ANON_KEY) {
    console.error('⚠️ Supabase no configurado. Configura las variables en Coolify.');
}

// Helper para construir URLs
function getSupabaseUrl(endpoint) {
    return `${SUPABASE_CONFIG.url}/rest/v1/${endpoint}`;
}
```

## 📡 Comunicación con Supabase (app.js)

```javascript
// Ejemplo de operaciones CRUD con Supabase

// CREATE - Insertar datos
async function crearRegistro(tabla, datos) {
    const response = await fetch(getSupabaseUrl(tabla), {
        method: 'POST',
        headers: SUPABASE_CONFIG.headers,
        body: JSON.stringify(datos)
    });
    
    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
}

// READ - Leer datos
async function leerRegistros(tabla, filtros = '') {
    const url = getSupabaseUrl(tabla) + filtros;
    const response = await fetch(url, {
        method: 'GET',
        headers: SUPABASE_CONFIG.headers
    });
    
    return await response.json();
}

// UPDATE - Actualizar datos
async function actualizarRegistro(tabla, id, datos) {
    const response = await fetch(getSupabaseUrl(`${tabla}?id=eq.${id}`), {
        method: 'PATCH',
        headers: SUPABASE_CONFIG.headers,
        body: JSON.stringify(datos)
    });
    
    return await response.json();
}

// DELETE - Eliminar datos
async function eliminarRegistro(tabla, id) {
    const response = await fetch(getSupabaseUrl(`${tabla}?id=eq.${id}`), {
        method: 'DELETE',
        headers: SUPABASE_CONFIG.headers
    });
    
    return response.ok;
}

// Realtime (opcional)
function suscribirseACambios(tabla, callback) {
    // Requiere @supabase/supabase-js
    console.log('Realtime requiere la librería oficial de Supabase');
}
```

## ⚙️ Configuración en Coolify

### 1. **Crear Nueva Aplicación**
```
- Source: GitHub
- Repository: tu-usuario/tu-repo
- Branch: main
- Build Pack: Dockerfile
```

### 2. **Configuración de Build**
```
- Dockerfile Location: ./Dockerfile
- Port: 8080 (IMPORTANTE)
```

### 3. **Variables de Entorno**
```bash
# En la sección "Environment Variables"
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NO uses comillas ni espacios extra
```

### 4. **Dominio Personalizado**
```
- Domain: app.tudominio.com
- Generate SSL: ✓ (automático con Let's Encrypt)
```

### 5. **Health Check (Opcional)**
```
- Path: /
- Port: 8080
- Interval: 30
```

## 🌐 Configuración de Puertos

```
┌─────────────────────────────────────────────┐
│              COOLIFY (VPS)                  │
├─────────────────────────────────────────────┤
│ Puerto Externo: 443 (HTTPS)                │
│ ↓                                           │
│ Caddy Proxy de Coolify                     │
│ ↓                                           │
│ Puerto Interno: 8080 (Tu App)              │
│ ↓                                           │
│ Caddy de tu App (sirve archivos)           │
└─────────────────────────────────────────────┘
                  ↓
         API Calls HTTPS
                  ↓
┌─────────────────────────────────────────────┐
│            SUPABASE                         │
├─────────────────────────────────────────────┤
│ Puerto: 443 (HTTPS API)                    │
│ Endpoints:                                  │
│ - /rest/v1/  (REST API)                    │
│ - /auth/v1/  (Autenticación)               │
│ - /storage/v1/ (Archivos)                  │
│ - /realtime/v1/ (WebSocket)                │
└─────────────────────────────────────────────┘
```

## 📝 .env.example (Documentación)

```bash
# Variables de Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui

# IMPORTANTE: 
# - Configura estas variables en Coolify, NO en el código
# - La ANON_KEY es pública, pero no la expongas innecesariamente
# - Para operaciones sensibles, usa Row Level Security (RLS)
```

## 🚀 Proceso de Deploy

### 1. **Preparar el código**
```bash
# Clonar plantilla
git clone https://github.com/xuli70/supabase-tutorial-coolify mi-app
cd mi-app

# Personalizar archivos
# Editar config.js, app.js, etc.

# Commit y push
git add .
git commit -m "Mi app con Supabase"
git push origin main
```

### 2. **Configurar en Coolify**
1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy

### 3. **Verificar funcionamiento**
1. Acceder a tu dominio
2. Abrir consola (F12)
3. Verificar: "✅ Conectado" a Supabase

## 🛡️ Seguridad y Mejores Prácticas

### 1. **Row Level Security (RLS)**
```sql
-- Activar RLS en tu tabla
ALTER TABLE tu_tabla ENABLE ROW LEVEL SECURITY;

-- Crear políticas
CREATE POLICY "Lectura pública" ON tu_tabla
    FOR SELECT USING (true);

CREATE POLICY "Insertar autenticados" ON tu_tabla
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### 2. **Validación en Frontend**
```javascript
// Siempre valida datos antes de enviar
function validarDatos(datos) {
    if (!datos.campo_requerido) {
        throw new Error('Campo requerido faltante');
    }
    // Más validaciones...
}
```

### 3. **Manejo de Errores**
```javascript
try {
    const resultado = await crearRegistro('tabla', datos);
} catch (error) {
    console.error('Error:', error);
    mostrarMensajeUsuario('Ocurrió un error. Intenta nuevamente.');
}
```

## 🔧 Solución de Problemas

### Error 502 Bad Gateway
- Verifica que el puerto sea 8080
- Revisa logs en Coolify
- Confirma que Caddy esté corriendo

### CORS errors
- Verifica headers en Caddyfile
- Confirma URL de Supabase correcta
- Revisa configuración de Supabase

### Variables no se cargan
- Confirma que env.js se carga primero
- Verifica variables en Coolify
- Hace falta redeploy después de cambios

### Connection refused
- Verifica que Supabase esté activo
- Confirma URL correcta
- Revisa firewall/puertos

## 📚 Recursos Adicionales

- **Supabase Docs**: https://supabase.com/docs
- **Coolify Docs**: https://coolify.io/docs
- **Caddy Docs**: https://caddyserver.com/docs

## 💡 Tips Finales

1. **Desarrollo Local**: Usa un `.env.local` con tus credenciales de desarrollo
2. **Logs**: Revisa logs en Coolify para debugging
3. **Backups**: Configura backups automáticos en Supabase
4. **Monitoreo**: Usa el dashboard de Supabase para monitorear uso
5. **Escalamiento**: Coolify maneja automáticamente el escalamiento horizontal

---

**Creado para**: Apps con Supabase + Coolify en VPS Hostinger
**Puerto Coolify**: 8080 (siempre)
**Servidor Web**: Caddy (más compatible)
**Autor**: xuli70