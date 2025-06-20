// Configuración de Supabase
// IMPORTANTE: Estas son tus credenciales reales
// En producción, deberías usar variables de entorno o un método más seguro

const SUPABASE_CONFIG = {
    // URL base de tu instancia de Supabase
    url: 'https://stik.axcsol.com',
    
    // API Key anónima (pública) - Usar esta para operaciones del cliente
    anonKey: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1MDMyOTMwMCwiZXhwIjo0OTA2MDAyOTAwLCJyb2xlIjoiYW5vbiJ9.czcXOEzr5UKmrc9OzK-Qhg8cey2qnw1iyCGJDlMBzyw',
    
    // Nombre de la tabla que creamos
    tableName: 'tutorial_tasks'
};

// Función helper para construir la URL completa del endpoint
function getApiUrl(endpoint = '') {
    return `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tableName}${endpoint}`;
}

// Headers comunes para todas las peticiones
function getHeaders() {
    return {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // Para que devuelva los datos después de crear/actualizar
    };
}

// Exportar para debugging
console.log('🔧 Configuración cargada:', {
    url: SUPABASE_CONFIG.url,
    tabla: SUPABASE_CONFIG.tableName,
    endpoint: getApiUrl()
});