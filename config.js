// Configuración de Supabase
// IMPORTANTE: Las credenciales se inyectan desde variables de entorno en Coolify
// No hardcodees credenciales aquí

const SUPABASE_CONFIG = {
    // URL base de tu instancia de Supabase
    url: window.ENV?.SUPABASE_URL || 'https://tu-proyecto.supabase.co',
    
    // API Key anónima (pública) - Se configura en Coolify
    anonKey: window.ENV?.SUPABASE_ANON_KEY || 'tu-anon-key-aqui',
    
    // Nombre de la tabla que creamos
    tableName: 'tutorial_tasks'
};

// Validar que las variables estén configuradas
if (!window.ENV?.SUPABASE_URL || !window.ENV?.SUPABASE_ANON_KEY) {
    console.error('⚠️ Variables de entorno no configuradas. Por favor configura SUPABASE_URL y SUPABASE_ANON_KEY en Coolify.');
    // Mostrar mensaje de error en la UI
    document.addEventListener('DOMContentLoaded', () => {
        const messageArea = document.getElementById('messageArea');
        if (messageArea) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message error';
            errorDiv.innerHTML = '⚠️ Error de configuración: Las credenciales de Supabase no están configuradas.<br>Por favor, contacta al administrador.';
            errorDiv.style.position = 'relative';
            messageArea.appendChild(errorDiv);
        }
    });
}

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

// Log de configuración (sin mostrar las credenciales completas)
console.log('🔧 Configuración cargada:', {
    url: SUPABASE_CONFIG.url,
    tabla: SUPABASE_CONFIG.tableName,
    credenciales: window.ENV?.SUPABASE_ANON_KEY ? '✅ Configuradas' : '❌ No configuradas'
});