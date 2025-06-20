#!/bin/sh
# Script para inyectar variables de entorno en la aplicación

# Crear el archivo env.js con las variables de entorno
cat > /app/env.js << EOF
// Variables de entorno inyectadas por Coolify
window.ENV = {
    SUPABASE_URL: "${SUPABASE_URL}",
    SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}"
};
EOF

echo "✅ Variables de entorno inyectadas correctamente"

# Iniciar Caddy
exec caddy run --config /app/Caddyfile --adapter caddyfile