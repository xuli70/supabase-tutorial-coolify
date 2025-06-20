#!/bin/sh
# Script para inyectar variables de entorno en la aplicación

# Crear el archivo env.js con las variables de entorno
cat > /app/env.js << EOF
// Variables de entorno inyectadas por Coolify
window.ENV = {
    // URL de Supabase
    SUPABASE_URL: "${SUPABASE_URL}",
    
    // API Keys para diferentes niveles de acceso
    SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}",
    SUPABASE_USER_KEY: "${SUPABASE_USER_KEY:-${SUPABASE_ANON_KEY}}",
    SUPABASE_ADMIN_KEY: "${SUPABASE_ADMIN_KEY:-${SUPABASE_SERVICE_KEY:-${SUPABASE_ANON_KEY}}}"
};
EOF

echo "✅ Variables de entorno inyectadas correctamente"
echo "   - URL: ${SUPABASE_URL}"
echo "   - Niveles de acceso configurados: guest, user, admin"

# Iniciar Caddy
exec caddy run --config /app/Caddyfile --adapter caddyfile