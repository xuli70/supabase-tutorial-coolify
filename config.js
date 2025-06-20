// Configuración de Supabase con niveles de acceso
// IMPORTANTE: Las credenciales se inyectan desde variables de entorno en Coolify

// Nivel de acceso actual (se guarda en localStorage)
let currentUserLevel = localStorage.getItem('userLevel') || null;

const SUPABASE_CONFIG = {
    // URL base de tu instancia de Supabase
    url: window.ENV?.SUPABASE_URL || 'https://tu-proyecto.supabase.co',
    
    // API Keys para diferentes niveles (configurar en Coolify)
    // TEMPORAL: Usando ANON_KEY para todos los niveles debido a permisos del schema
    keys: {
        guest: window.ENV?.SUPABASE_ANON_KEY || 'configurar-anon-key',
        user: window.ENV?.SUPABASE_ANON_KEY || 'configurar-user-key',
        admin: window.ENV?.SUPABASE_ANON_KEY || 'configurar-admin-key'
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
    
    const key = SUPABASE_CONFIG.keys[currentUserLevel] || SUPABASE_CONFIG.keys.guest;
    
    // Debug: mostrar qué clave se está usando
    console.log(`🔑 Usando clave para nivel ${currentUserLevel}:`, key.substring(0, 20) + '...');
    
    return key;
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
    
    // Debug: mostrar headers que se enviarán
    const headers = {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // Para que devuelva los datos después de crear/actualizar
    };
    
    console.log('📡 Headers enviados:', {
        apikey: headers.apikey.substring(0, 20) + '...',
        Authorization: 'Bearer ' + headers.apikey.substring(0, 20) + '...'
    });
    
    return headers;
}

// Establecer nivel de usuario
function setUserLevel(level) {
    if (['guest', 'user', 'admin'].includes(level)) {
        currentUserLevel = level;
        localStorage.setItem('userLevel', level);
        console.log(`✅ Nivel de acceso establecido: ${level}`);
        
        // Debug: mostrar qué clave se usará
        console.log('🔍 Claves disponibles:', {
            guest: SUPABASE_CONFIG.keys.guest?.substring(0, 20) + '...',
            user: SUPABASE_CONFIG.keys.user?.substring(0, 20) + '...',
            admin: SUPABASE_CONFIG.keys.admin?.substring(0, 20) + '...'
        });
        
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

// Función de debug para probar conexión
async function testConnection() {
    console.log('🧪 Probando conexión con Supabase...');
    
    try {
        const response = await fetch(getApiUrl('?limit=1'), {
            method: 'GET',
            headers: getHeaders()
        });
        
        console.log('📊 Respuesta:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexión exitosa! Datos:', data);
            return true;
        } else {
            const error = await response.text();
            console.error('❌ Error en la conexión:', error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error de red:', error);
        return false;
    }
}

// Log de configuración (sin mostrar las credenciales completas)
console.log('🔧 Configuración cargada:', {
    url: SUPABASE_CONFIG.url,
    tabla: SUPABASE_CONFIG.tableName,
    nivelesDisponibles: Object.keys(SUPABASE_CONFIG.keys),
    nivelActual: currentUserLevel || 'No seleccionado',
    nota: 'TEMPORAL: Usando ANON_KEY para todos los niveles'
});

// Exportar funciones para uso global
window.setUserLevel = setUserLevel;
window.getUserLevel = getUserLevel;
window.clearUserLevel = clearUserLevel;
window.canPerformAction = canPerformAction;
window.getCurrentApiKey = getCurrentApiKey;
window.testConnection = testConnection;
