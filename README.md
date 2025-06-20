# Tutorial Supabase CRUD con Coolify

Esta es una aplicación web simple que sirve como tutorial para aprender a interactuar con Supabase desplegado en un VPS con Coolify.

## 🏆 Estado del Proyecto

- ✅ Aplicación CRUD funcional
- ✅ Desplegada en https://tu-app.ejemplo.com
- ✅ Credenciales securizadas con variables de entorno
- ✅ Scripts RLS preparados (pendiente de activar)
- ✅ Sistema de niveles de acceso implementado
- ✅ Documentación completa con chuletas

## 🎯 Objetivo

Aprender las operaciones básicas CRUD (Create, Read, Update, Delete) con Supabase usando JavaScript vanilla, con enfoque en seguridad y mejores prácticas.

## 🛠️ Tecnologías

- **Frontend**: HTML, CSS, JavaScript vanilla (sin frameworks)
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Coolify con Docker
- **Servidor Web**: Caddy
- **Hosting**: VPS Hostinger
- **Seguridad**: Variables de entorno + RLS

## 📋 Requisitos Previos

1. Supabase instalado y funcionando en tu VPS
2. La tabla `tutorial_tasks` creada en tu base de datos
3. Acceso a las API keys de Supabase (configuradas en Coolify)
4. Coolify configurado en tu VPS

## 🚀 Instalación y Deploy

### 1. Clonar el repositorio

```bash
git clone https://github.com/xuli70/supabase-tutorial-coolify.git
cd supabase-tutorial-coolify
```

### 2. Configurar en Coolify

1. **Crear nueva aplicación** en Coolify
2. **Tipo**: Dockerfile
3. **Puerto**: 8080
4. **Variables de entorno** (IMPORTANTE):
   ```
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key-aqui
   SUPABASE_USER_KEY=tu-user-key-aqui (opcional)
   SUPABASE_ADMIN_KEY=tu-service-role-key-aqui (opcional)
   ```

### 3. Deploy

Coolify hará el deploy automáticamente al conectar el repositorio.

## 🔐 Sistema de Niveles de Acceso

La aplicación incluye un sistema educativo de niveles que simula diferentes permisos:

### Niveles disponibles:

1. **👁️ Invitado** - Solo lectura
   - Ver tareas
   - Filtrar y ordenar
   - Sin permisos de escritura

2. **👤 Usuario** - Lectura y escritura
   - Ver tareas
   - Crear tareas
   - Editar tareas
   - No puede eliminar

3. **👨‍💼 Administrador** - Control total
   - Todos los permisos anteriores
   - Eliminar tareas
   - Ver panel de debug

### ⚠️ Nota importante:
Este sistema de niveles es **educativo**. En producción real, NUNCA expongas diferentes API keys en el frontend. Usa autenticación real con Supabase Auth.

## 🔒 Seguridad Implementada

### 1. Variables de Entorno
- Las credenciales NO están en el código
- Se inyectan en runtime desde Coolify
- Ver: `SECURITY_ENV_VARS_CHEATSHEET.md`

### 2. Row Level Security (RLS)
- Scripts preparados en `/sql/`
- Guía completa en `RLS_SECURITY_CHEATSHEET.md`
- **Estado**: Listo para activar

### Para activar RLS:
```sql
-- Ejecutar en Supabase SQL Editor
-- Usar el archivo: sql/01_enable_rls_basic.sql
```

## 📚 Estructura del Proyecto

```
├── index.html            # Estructura HTML
├── styles.css            # Estilos minimalistas
├── config.js             # Configuración (usa variables de entorno)
├── app.js                # Lógica CRUD
├── entrypoint.sh         # Script para inyectar variables
├── Dockerfile            # Configuración Docker para Coolify
├── sql/                  # Scripts SQL para RLS
│   ├── 01_enable_rls_basic.sql
│   ├── 02_rls_advanced_examples.sql
│   └── 03_test_rls.sql
└── Chuletas/             # Documentación de referencia
    ├── DOCKERFILE_COOLIFY_CHEATSHEET.md
    ├── SECURITY_ENV_VARS_CHEATSHEET.md
    ├── SUPABASE_COOLIFY_VPS_CHEATSHEET.md
    ├── RLS_SECURITY_CHEATSHEET.md
    └── ACCESS_LEVELS_CHEATSHEET.md
```

## 🔧 Funcionalidades

### Operaciones CRUD
- ✅ **CREATE**: Crear nuevas tareas
- ✅ **READ**: Listar y filtrar tareas
- ✅ **UPDATE**: Editar tareas existentes
- ✅ **DELETE**: Eliminar tareas

### Características Extra
- Sistema de niveles de acceso
- Filtrado por estado
- Ordenamiento dinámico
- Mensajes de feedback
- Panel de debug (solo admin)
- Verificación de conexión
- Interfaz responsiva

## 📖 Chuletas de Referencia

### 1. [DOCKERFILE_COOLIFY_CHEATSHEET.md](DOCKERFILE_COOLIFY_CHEATSHEET.md)
- Cómo crear Dockerfiles para Coolify
- Puerto 8080 y configuración de Caddy

### 2. [SECURITY_ENV_VARS_CHEATSHEET.md](SECURITY_ENV_VARS_CHEATSHEET.md)
- Protección de credenciales
- Implementación de variables de entorno

### 3. [SUPABASE_COOLIFY_VPS_CHEATSHEET.md](SUPABASE_COOLIFY_VPS_CHEATSHEET.md)
- Guía completa de integración
- Arquitectura y flujo de datos

### 4. [RLS_SECURITY_CHEATSHEET.md](RLS_SECURITY_CHEATSHEET.md)
- Row Level Security explicado
- Implementación paso a paso

### 5. [ACCESS_LEVELS_CHEATSHEET.md](ACCESS_LEVELS_CHEATSHEET.md)
- Sistema de niveles de acceso
- Implementación educativa de permisos

## 🎓 Conceptos que Aprendes

1. **Conexión con Supabase**
   - Configuración segura con variables de entorno
   - Headers y autenticación
   - Construcción de endpoints

2. **Operaciones HTTP**
   - GET, POST, PATCH, DELETE
   - Manejo de respuestas JSON
   - Control de errores

3. **Seguridad**
   - Variables de entorno
   - Row Level Security
   - Mejores prácticas

4. **Deploy con Coolify**
   - Dockerfile optimizado
   - Configuración de puertos
   - Variables de entorno

## 🐛 Solución de Problemas

### Error 502 Bad Gateway
- Verificar puerto 8080 en Dockerfile
- Confirmar que Caddy está corriendo

### Variables no configuradas
- Revisar variables en Coolify
- Hacer redeploy después de cambios

### RLS activado pero app no funciona
- Verificar políticas en `/sql/`
- Usar script básico primero

## 🚀 Próximos Pasos

1. **Activar RLS** ejecutando `sql/01_enable_rls_basic.sql`
2. **Agregar autenticación** con Supabase Auth
3. **Implementar RLS avanzado** (ver ejemplos en `/sql/`)
4. **Agregar más funcionalidades**:
   - Upload de archivos
   - Realtime subscriptions
   - Búsqueda avanzada

## 👥 Contribuciones

Este es un proyecto educativo. Si encuentras mejoras o correcciones, ¡los PRs son bienvenidos!

## 📄 Licencia

Proyecto de código abierto para fines educativos.

## 🙏 Agradecimientos

- Supabase por la plataforma
- Coolify por simplificar el deployment
- La comunidad por el feedback

---

**Autor**: xuli70  
**Propósito**: Tutorial educativo  
**Stack**: Supabase + Coolify + VPS
