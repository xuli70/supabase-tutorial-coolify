# 🔐 Sistema de Niveles de Acceso - Chuleta Completa

> **⚠️ IMPORTANTE**: Esta implementación es educativa. En producción real, NUNCA expongas diferentes API keys en el frontend. Usa autenticación real con Supabase Auth.

## 📋 Índice
1. [Concepto](#concepto)
2. [Arquitectura](#arquitectura)
3. [Implementación Paso a Paso](#implementación-paso-a-paso)
4. [Configuración en Coolify](#configuración-en-coolify)
5. [Cómo Funciona](#cómo-funciona)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Limitaciones](#limitaciones)

## 🎯 Concepto

Sistema educativo que simula diferentes niveles de acceso usando múltiples API keys de Supabase:

```
┌─────────────────┐
│  Selector UI    │
├─────────────────┤
│ 👁️ Invitado     │ → SUPABASE_ANON_KEY
│ 👤 Usuario      │ → SUPABASE_USER_KEY
│ 👨‍💼 Admin       │ → SUPABASE_ADMIN_KEY
└─────────────────┘
```

## 🏗️ Arquitectura

### 1. **Frontend (JavaScript)**
```javascript
// config.js
let currentUserLevel = localStorage.getItem('userLevel') || null;

const SUPABASE_CONFIG = {
    keys: {
        guest: window.ENV?.SUPABASE_ANON_KEY,
        user: window.ENV?.SUPABASE_USER_KEY || window.ENV?.SUPABASE_ANON_KEY,
        admin: window.ENV?.SUPABASE_ADMIN_KEY || window.ENV?.SUPABASE_SERVICE_KEY
    }
};
```

### 2. **Variables de Entorno (Coolify)**
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAi...        # Solo lectura
SUPABASE_USER_KEY=eyJ0eXAi...        # CRUD limitado
SUPABASE_ADMIN_KEY=eyJ0eXAi...       # Control total
```

### 3. **Inyección en Runtime**
```javascript
// env.js (generado por entrypoint.sh)
window.ENV = {
    SUPABASE_URL: "https://stik.asciidool.com",
    SUPABASE_ANON_KEY: "eyJ0eXAi...",
    SUPABASE_USER_KEY: "eyJ0eXAi...",
    SUPABASE_ADMIN_KEY: "eyJ0eXAi..."
};
```

## 📝 Implementación Paso a Paso

### Paso 1: Crear el selector de niveles (HTML)

```html
<!-- index.html -->
<section id="levelSelector" class="level-selector">
    <h2>🔐 Selecciona tu nivel de acceso</h2>
    <div class="level-cards">
        <div class="level-card" onclick="selectLevel('guest')">
            <div class="level-icon">👁️</div>
            <h3>Invitado</h3>
            <p>Solo lectura</p>
            <ul>
                <li>✅ Ver tareas</li>
                <li>❌ No puede crear</li>
                <li>❌ No puede editar</li>
                <li>❌ No puede eliminar</li>
            </ul>
        </div>
        
        <div class="level-card" onclick="selectLevel('user')">
            <div class="level-icon">👤</div>
            <h3>Usuario</h3>
            <p>Lectura y escritura</p>
            <ul>
                <li>✅ Ver tareas</li>
                <li>✅ Crear tareas</li>
                <li>✅ Editar tareas</li>
                <li>❌ No puede eliminar</li>
            </ul>
        </div>
        
        <div class="level-card" onclick="selectLevel('admin')">
            <div class="level-icon">👨‍💼</div>
            <h3>Administrador</h3>
            <p>Control total</p>
            <ul>
                <li>✅ Ver tareas</li>
                <li>✅ Crear tareas</li>
                <li>✅ Editar tareas</li>
                <li>✅ Eliminar tareas</li>
                <li>✅ Ver debug completo</li>
            </ul>
        </div>
    </div>
</section>
```

### Paso 2: Configurar la lógica de niveles (JavaScript)

```javascript
// config.js
// Obtener la API key según el nivel actual
function getCurrentApiKey() {
    if (!currentUserLevel) {
        console.warn('No se ha seleccionado un nivel de acceso');
        return SUPABASE_CONFIG.keys.guest;
    }
    return SUPABASE_CONFIG.keys[currentUserLevel] || SUPABASE_CONFIG.keys.guest;
}

// Establecer nivel de usuario
function setUserLevel(level) {
    if (['guest', 'user', 'admin'].includes(level)) {
        currentUserLevel = level;
        localStorage.setItem('userLevel', level);
        console.log(`✅ Nivel de acceso establecido: ${level}`);
        return true;
    }
    console.error('❌ Nivel de acceso inválido:', level);
    return false;
}

// Verificar permisos para una acción
function canPerformAction(action) {
    const permissions = {
        guest: ['read'],
        user: ['read', 'create', 'update'],
        admin: ['read', 'create', 'update', 'delete', 'debug']
    };
    
    const userPermissions = permissions[currentUserLevel] || permissions.guest;
    return userPermissions.includes(action);
}
```

### Paso 3: Implementar control de UI según nivel

```javascript
// app.js
function selectLevel(level) {
    setUserLevel(level);
    
    // Ocultar selector y mostrar app
    document.getElementById('levelSelector').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Actualizar UI según nivel
    updateUIForLevel(level);
    
    // Cargar tareas con la nueva key
    cargarTareas();
}

function updateUIForLevel(level) {
    const formSection = document.getElementById('formSection');
    const debugDetails = document.getElementById('debugDetails');
    
    switch(level) {
        case 'guest':
            // Invitado: solo lectura
            formSection.style.display = 'none';
            debugDetails.style.display = 'none';
            break;
            
        case 'user':
            // Usuario: puede crear y editar, no eliminar
            formSection.style.display = 'block';
            debugDetails.style.display = 'none';
            break;
            
        case 'admin':
            // Admin: acceso total
            formSection.style.display = 'block';
            debugDetails.style.display = 'block';
            break;
    }
}
```

### Paso 4: Aplicar permisos en operaciones CRUD

```javascript
// Antes de cada operación, verificar permisos
async function crearTarea(datos) {
    if (!canPerformAction('create')) {
        mostrarMensaje('⚠️ No tienes permisos para crear tareas', 'warning');
        return;
    }
    // ... código de creación
}

async function actualizarTarea(id, datos) {
    if (!canPerformAction('update')) {
        mostrarMensaje('⚠️ No tienes permisos para actualizar tareas', 'warning');
        return;
    }
    // ... código de actualización
}

async function eliminarTarea(id) {
    if (!canPerformAction('delete')) {
        mostrarMensaje('⚠️ No tienes permisos para eliminar tareas', 'warning');
        return;
    }
    // ... código de eliminación
}
```

### Paso 5: Mostrar botones según permisos

```javascript
function mostrarTareas() {
    tareas.forEach(tarea => {
        const botones = `
            ${canPerformAction('update') ? 
                `<button onclick="editarTarea(${tarea.id})">✏️ Editar</button>` : 
                '<button disabled>✏️ Editar</button>'
            }
            ${canPerformAction('delete') ? 
                `<button onclick="eliminarTarea(${tarea.id})">🗑️ Eliminar</button>` : 
                '<button disabled>🗑️ Eliminar</button>'
            }
        `;
        // ... renderizar tarea con botones
    });
}
```

## ⚙️ Configuración en Coolify

### 1. Variables de entorno necesarias:

```bash
# Básicas (requeridas)
SUPABASE_URL=https://stik.asciidool.com
SUPABASE_ANON_KEY=eyJ0eXAi...  # Del dashboard de Supabase

# Opcionales para niveles adicionales
SUPABASE_USER_KEY=eyJ0eXAi...  # Misma ANON_KEY o crear rol específico
SUPABASE_ADMIN_KEY=eyJ0eXAi... # SERVICE_ROLE_KEY (¡cuidado!)
```

### 2. En el dashboard de Coolify:
1. Ir a tu aplicación
2. Settings → Environment Variables
3. Agregar las 3-4 variables
4. Save & Redeploy

## 🔄 Cómo Funciona

### Flujo completo:

```
1. Usuario entra a la app
   ↓
2. Ve selector de niveles
   ↓
3. Elige un nivel (ej: "Usuario")
   ↓
4. JavaScript:
   - Guarda nivel en localStorage
   - Obtiene la API key correspondiente
   - Actualiza la UI (oculta/muestra elementos)
   ↓
5. Todas las peticiones a Supabase usan esa key
   ↓
6. La app se comporta según los permisos
```

### Headers enviados según nivel:

```javascript
// Invitado
headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
}

// Admin
headers: {
    'apikey': SUPABASE_ADMIN_KEY,
    'Authorization': `Bearer ${SUPABASE_ADMIN_KEY}`
}
```

## ✅ Mejores Prácticas

### 1. **Seguridad en producción**
```javascript
// ❌ NUNCA en producción real
const keys = {
    admin: 'service_role_key_aqui' // ¡PELIGRO!
}

// ✅ En producción usar Supabase Auth
const { data: { user } } = await supabase.auth.getUser()
```

### 2. **Validación doble**
```javascript
// Frontend (UI/UX)
if (!canPerformAction('delete')) {
    hideDeleteButton();
}

// Backend (RLS en Supabase)
CREATE POLICY "Users can delete own tasks" ON tasks
FOR DELETE USING (auth.uid() = user_id);
```

### 3. **Feedback claro**
```javascript
function mostrarPermisos() {
    const nivel = getUserLevel();
    const permisos = {
        guest: "Solo puedes ver las tareas",
        user: "Puedes crear y editar tareas",
        admin: "Tienes control total"
    };
    mostrarMensaje(`Nivel ${nivel}: ${permisos[nivel]}`, 'info');
}
```

## ⚠️ Limitaciones

### 1. **Solo educativo**
- No es seguridad real
- Las keys están en el frontend
- Cualquiera puede ver el código fuente

### 2. **En producción real necesitas:**
- Autenticación real (Supabase Auth)
- RLS (Row Level Security)
- Roles y permisos en el backend
- JWT tokens personalizados

### 3. **Riesgos de exponer SERVICE_ROLE_KEY:**
```
⚠️ PELIGRO: La SERVICE_ROLE_KEY tiene acceso TOTAL
- Puede leer/escribir/eliminar TODO
- Bypasea RLS
- NUNCA exponerla en frontend
```

## 🚀 Evolución hacia producción

### Paso 1: Implementar Auth real
```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password'
})

// La sesión maneja automáticamente los tokens
```

### Paso 2: Usar roles personalizados
```sql
-- En Supabase
CREATE TYPE user_role AS ENUM ('guest', 'user', 'admin');

ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'user';
```

### Paso 3: RLS basado en roles
```sql
CREATE POLICY "Admins can delete any task" ON tasks
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
```

## 📚 Recursos adicionales

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [JWT y Roles](https://supabase.com/docs/guides/auth/custom-claims-and-role-based-access-control-rbac)

---

**Recuerda**: Este sistema es perfecto para aprender y hacer demos, pero para producción siempre usa autenticación real. ¡La seguridad no es opcional!
