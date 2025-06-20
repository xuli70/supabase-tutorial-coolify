# Tutorial Supabase CRUD con Coolify

Esta es una aplicación web simple que sirve como tutorial para aprender a interactuar con Supabase desplegado en un VPS con Coolify.

## 🎯 Objetivo

Aprender las operaciones básicas CRUD (Create, Read, Update, Delete) con Supabase usando JavaScript vanilla.

## 🛠️ Tecnologías

- **Frontend**: HTML, CSS, JavaScript vanilla (sin frameworks)
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Coolify
- **Hosting**: VPS Hostinger

## 📋 Requisitos Previos

1. Supabase instalado y funcionando en tu VPS
2. La tabla `tutorial_tasks` creada en tu base de datos
3. Acceso a las API keys de Supabase

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/xuli70/supabase-tutorial-coolify.git
cd supabase-tutorial-coolify
```

### 2. Configurar las credenciales

Las credenciales ya están configuradas en `config.js` con tus datos reales:
- URL: `https://stik.axcsol.com`
- API Key: Ya incluida

### 3. Deploy con Coolify

1. En tu panel de Coolify, crea una nueva aplicación
2. Selecciona "Static Site" como tipo de aplicación
3. Conecta este repositorio de GitHub
4. Configura el build:
   - Build Command: (dejar vacío, no necesita build)
   - Publish Directory: `/` (raíz del proyecto)
5. Deploy!

## 📚 Estructura del Proyecto

```
├── index.html      # Estructura HTML de la aplicación
├── styles.css      # Estilos minimalistas
├── config.js       # Configuración de Supabase
├── app.js          # Lógica de la aplicación (CRUD)
└── README.md       # Este archivo
```

## 🔧 Funcionalidades

### Operaciones CRUD

1. **CREATE**: Crear nuevas tareas con título, descripción, estado y prioridad
2. **READ**: Listar todas las tareas con filtros y ordenamiento
3. **UPDATE**: Editar tareas existentes
4. **DELETE**: Eliminar tareas

### Características Extra

- Filtrado por estado
- Ordenamiento por fecha, prioridad o título
- Mensajes de feedback para cada operación
- Panel de debug para ver las respuestas de la API
- Interfaz responsive

## 🎓 Conceptos que Aprenderás

1. **Conexión con Supabase**
   - Configurar headers con API key
   - Construir URLs de endpoints

2. **Operaciones HTTP**
   - GET para leer datos
   - POST para crear
   - PATCH para actualizar
   - DELETE para eliminar

3. **Manejo de respuestas**
   - Procesar JSON
   - Manejar errores
   - Mostrar feedback al usuario

4. **Filtros y queries**
   - Usar operadores de Supabase (eq, order)
   - Construir queries dinámicas

## 📝 Ejemplos de Código

### Crear una tarea
```javascript
const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
        title: 'Mi nueva tarea',
        description: 'Descripción',
        status: 'pendiente',
        priority: 3
    })
});
```

### Leer tareas con filtros
```javascript
// Filtrar por estado y ordenar por prioridad
const response = await fetch(getApiUrl('?status=eq.pendiente&order=priority.desc'), {
    method: 'GET',
    headers: getHeaders()
});
```

## 🔐 Seguridad

**IMPORTANTE**: Esta aplicación es solo para fines educativos. En producción:

1. No expongas las API keys en el código del cliente
2. Implementa Row Level Security (RLS) en Supabase
3. Usa autenticación para proteger las operaciones
4. Valida todos los inputs en el servidor

## 🐛 Solución de Problemas

### Error de CORS
Si encuentras errores de CORS, verifica que tu dominio esté configurado correctamente en Supabase.

### Error 401 Unauthorized
Verifica que la API key sea correcta y tenga los permisos necesarios.

### La tabla no existe
Asegúrate de haber ejecutado el script SQL para crear la tabla `tutorial_tasks`.

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa el panel de debug en la aplicación
2. Verifica los logs en Coolify
3. Revisa la consola del navegador (F12)

## 🚀 Próximos Pasos

Una vez que domines este tutorial, puedes:

1. Agregar autenticación de usuarios
2. Implementar Row Level Security
3. Crear relaciones entre tablas
4. Usar Realtime subscriptions
5. Agregar upload de archivos

## 📄 Licencia

Este proyecto es de código abierto y está disponible para fines educativos.

---

**Creado por**: xuli70  
**Propósito**: Tutorial de aprendizaje Supabase + Coolify