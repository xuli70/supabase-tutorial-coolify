# 🔐 Configuración Segura en Coolify

Esta guía te explica cómo configurar las variables de entorno de forma segura en Coolify.

## ⚠️ IMPORTANTE: Seguridad

**NUNCA** pongas tus credenciales reales en el código. Siempre usa variables de entorno.

## 📋 Pasos para configurar

### 1. Accede a tu aplicación en Coolify

1. Entra en tu panel de Coolify
2. Selecciona la aplicación `supabase-tutorial-coolify`

### 2. Configura las Variables de Entorno

1. Ve a la sección **"Environment Variables"** o **"Variables de Entorno"**
2. Agrega las siguientes variables:

```bash
SUPABASE_URL=https://stik.axcsol.com
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...(tu key completa aquí)
```

### 3. Formato correcto

- **NO uses comillas** alrededor de los valores
- **NO uses espacios** antes o después del `=`
- Cada variable en una línea separada

### 4. Guarda y Redeploy

1. Click en **"Save"** o **"Guardar"**
2. Click en **"Redeploy"** o **"Deploy"**

## 🧪 Verificar que funciona

1. Accede a tu aplicación: https://tuto.axcsol.com
2. Abre la consola del navegador (F12)
3. Deberías ver:
   - ✅ "Configuración cargada: credenciales: ✅ Configuradas"
   - Si ves ❌, revisa las variables en Coolify

## 🔄 Rotar las API Keys (Recomendado)

Después de configurar todo:

1. Ve a tu panel de Supabase
2. Genera nuevas API Keys
3. Actualiza las variables en Coolify
4. Redeploy

## 🛡️ Mejores prácticas

1. **Usa diferentes keys** para desarrollo y producción
2. **Activa RLS** en Supabase para mayor seguridad
3. **Revisa los logs** regularmente
4. **No compartas** las credenciales con nadie

## 🆘 Solución de problemas

### Error: "Variables de entorno no configuradas"
- Verifica que las variables estén bien escritas
- Asegúrate de hacer redeploy después de cambiarlas

### Error 401 Unauthorized
- Verifica que la API key sea correcta
- Comprueba que no tenga espacios extra

### La aplicación no carga
- Revisa los logs en Coolify
- Verifica que el puerto sea 8080

---

**Recuerda**: La seguridad es lo primero. Nunca expongas tus credenciales en el código.