// Configuración de Supabase con niveles de acceso
// IMPORTANTE: Las credenciales se inyectan desde variables de entorno en Coolify

// Nivel de acceso actual (se guarda en localStorage)
let currentUserLevel = localStorage.getItem('userLevel') || null;

const SUPABASE_CONFIG = {
    // URL base de tu instancia de Supabase
    url: window.ENV?.SUPABASE_URL || 'https://tu-proyecto.supabase.co',
    
    // API Keys para diferentes niveles (configurar en Coolify)
    keys: {
        guest: window.ENV?.SUPABASE_ANON_KEY || 'configurar-anon-key',
        user: window.ENV?.SUPABASE_USER_KEY || window.ENV?.SUPABASE_ANON_KEY || 'configurar-user-key',
        admin: window.ENV?.SUPABASE_ADMIN_KEY || window.ENV?.SUPABASE_SERVICE_KEY || 'configurar-admin-key'
    },
    
    // Nombre de la tabla que creamos
    tableName: 'tutorial_tasks'
};

// Obtener la API key según el nivel actual
function getCurrentApiKey() {
    if (!currentUserLevel) {
        console.warn('No se ha seleccionado un nivel de acceso');
        return SUPABASE_CONFIG.keys.guest;
    }
    return SUPABASE_CONFIG.keys[currentUserLevel] || SUPABASE_CONFIG.keys.guest;
}

// Validar que las variables estén configuradas
function validateConfig() {
    if (!window.ENV?.SUPABASE_URL || !window.ENV?.SUPABASE_ANON_KEY) {
        console.error('⚠️ Variables de entorno no configuradas. Por favor configura SUPABASE_URL y SUPABASE_ANON_KEY en Coolify.');
        return false;
    }
    return true;
}

// Función helper para construir la URL completa del endpoint
function getApiUrl(endpoint = '') {
    return `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tableName}${endpoint}`;
}

// Headers comunes para todas las peticiones
function getHeaders() {
    const apiKey = getCurrentApiKey();
    return {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // Para que devuelva los datos después de crear/actualizar
    };
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

// Obtener nivel actual
function getUserLevel() {
    return currentUserLevel;
}

// Limpiar nivel (logout)
function clearUserLevel() {
    currentUserLevel = null;
    localStorage.removeItem('userLevel');
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

// Log de configuración (sin mostrar las credenciales completas)
console.log('🔧 Configuración cargada:', {
    url: SUPABASE_CONFIG.url,
    tabla: SUPABASE_CONFIG.tableName,
    nivelesDisponibles: Object.keys(SUPABASE_CONFIG.keys),
    nivelActual: currentUserLevel || 'No seleccionado'
});

// Exportar funciones para uso global
window.setUserLevel = setUserLevel;
window.getUserLevel = getUserLevel;
window.clearUserLevel = clearUserLevel;
window.canPerformAction = canPerformAction;