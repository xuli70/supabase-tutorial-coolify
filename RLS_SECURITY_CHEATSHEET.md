# 🛡️ CHULETA ROW LEVEL SECURITY (RLS) - Supabase

Guía completa para implementar seguridad a nivel de fila en tus tablas de Supabase.

## 📋 ¿Qué es RLS?

**Row Level Security (RLS)** es una característica de PostgreSQL que permite controlar el acceso a nivel de FILA individual. En lugar de dar acceso a toda la tabla, defines reglas sobre qué filas puede ver/modificar cada usuario.

### Sin RLS vs Con RLS
```
SIN RLS:                          CON RLS:
┌─────────────────┐              ┌─────────────────┐
│ Tabla Completa  │              │ Tabla Completa  │
│ ┌─────────────┐ │              │ ┌─────────────┐ │
│ │ Fila 1      │ │ ❌           │ │ Fila 1      │ │ ✅ (si cumple política)
│ │ Fila 2      │ │ Todos        │ │ Fila 2      │ │ ❌ (no cumple)
│ │ Fila 3      │ │ pueden       │ │ Fila 3      │ │ ✅ (si cumple)
│ │ Fila 4      │ │ acceder      │ │ Fila 4      │ │ ❌ (no cumple)
│ └─────────────┘ │              │ └─────────────┘ │
└─────────────────┘              └─────────────────┘
```

## 🚨 Por qué es CRÍTICO activar RLS

1. **Sin RLS**: Cualquiera con tu `anon key` puede:
   - Leer TODOS los datos
   - Modificar CUALQUIER registro
   - Eliminar TODO
   - Hacer consultas masivas

2. **Con RLS**: Control granular sobre:
   - Quién ve qué
   - Quién modifica qué
   - Basado en reglas que TÚ defines

## 📊 Niveles de Seguridad RLS

### 🟢 Nivel 0: Sin RLS (INSEGURO)
```sql
-- Estado por defecto - NO RECOMENDADO para producción
-- La tabla está completamente abierta
```

### 🟡 Nivel 1: RLS Básico Permisivo
```sql
-- RLS activado pero con políticas abiertas
-- Útil para desarrollo y transición
ALTER TABLE tu_tabla ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_select" ON tu_tabla FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON tu_tabla FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update" ON tu_tabla FOR UPDATE USING (true);
CREATE POLICY "allow_all_delete" ON tu_tabla FOR DELETE USING (true);
```

### 🟠 Nivel 2: Solo Usuarios Autenticados
```sql
-- Requiere que los usuarios estén logueados
CREATE POLICY "authenticated_only" ON tu_tabla
FOR ALL USING (auth.role() = 'authenticated');
```

### 🔴 Nivel 3: Control por Usuario
```sql
-- Cada usuario solo ve/modifica SUS datos
CREATE POLICY "users_own_data" ON tu_tabla
FOR ALL USING (auth.uid() = user_id);
```

## 🔧 Implementación Paso a Paso

### 1. Activar RLS en tu tabla
```sql
-- Ejecuta en Supabase SQL Editor
ALTER TABLE tutorial_tasks ENABLE ROW LEVEL SECURITY;
```

### 2. Crear políticas básicas
```sql
-- Política de lectura (SELECT)
CREATE POLICY "nombre_politica_select" 
ON tutorial_tasks 
FOR SELECT 
USING (condicion_aqui);

-- Política de inserción (INSERT)
CREATE POLICY "nombre_politica_insert" 
ON tutorial_tasks 
FOR INSERT 
WITH CHECK (condicion_aqui);

-- Política de actualización (UPDATE)
CREATE POLICY "nombre_politica_update" 
ON tutorial_tasks 
FOR UPDATE 
USING (condicion_lectura)
WITH CHECK (condicion_escritura);

-- Política de eliminación (DELETE)
CREATE POLICY "nombre_politica_delete" 
ON tutorial_tasks 
FOR DELETE 
USING (condicion_aqui);
```

### 3. Sintaxis de condiciones

#### Condiciones básicas
```sql
-- Siempre true (permite todo)
USING (true)

-- Verificar rol
USING (auth.role() = 'authenticated')

-- Verificar usuario específico
USING (auth.uid() = user_id)

-- Verificar email
USING (auth.email() = 'usuario@ejemplo.com')

-- Condiciones múltiples
USING (auth.uid() = user_id AND status = 'active')
```

#### Funciones útiles de Supabase
```sql
auth.uid()      -- UUID del usuario actual
auth.role()     -- Rol: 'anon' o 'authenticated'
auth.email()    -- Email del usuario
auth.jwt()      -- Token JWT completo
```

## 📝 Ejemplos Prácticos

### Ejemplo 1: Blog - Todos leen, solo autor edita
```sql
-- Todos pueden leer posts publicados
CREATE POLICY "public_read_posts" ON posts
FOR SELECT USING (published = true);

-- Solo el autor puede editar sus posts
CREATE POLICY "author_all_own_posts" ON posts
FOR ALL USING (auth.uid() = author_id);
```

### Ejemplo 2: Sistema de tareas compartidas
```sql
-- Ver tareas propias o donde eres colaborador
CREATE POLICY "view_own_or_shared" ON tasks
FOR SELECT USING (
    owner_id = auth.uid() 
    OR id IN (
        SELECT task_id FROM task_collaborators 
        WHERE user_id = auth.uid()
    )
);
```

### Ejemplo 3: Multi-tenant con organizaciones
```sql
-- Solo ver datos de tu organización
CREATE POLICY "org_isolation" ON company_data
FOR ALL USING (
    org_id IN (
        SELECT org_id FROM user_organizations 
        WHERE user_id = auth.uid()
    )
);
```

## 🧪 Testing y Verificación

### 1. Verificar que RLS está activado
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tutorial_tasks';
```

### 2. Ver políticas activas
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'tutorial_tasks';
```

### 3. Probar como usuario anónimo
```sql
-- Cambiar a rol anónimo
SET ROLE anon;
-- Intentar consultas
SELECT * FROM tutorial_tasks;
-- Volver a admin
RESET ROLE;
```

## ⚠️ Errores Comunes y Soluciones

### Error: "new row violates row-level security policy"
**Causa**: La política WITH CHECK no se cumple
**Solución**: Verificar que los datos cumplen la condición

### Error: "permission denied for table"
**Causa**: No hay política que permita la operación
**Solución**: Crear política apropiada o verificar condiciones

### La app dejó de funcionar tras activar RLS
**Causa**: No creaste políticas permisivas
**Solución**: Agregar políticas básicas primero, luego restrictivas

## 🚀 Migración Segura a RLS

### Fase 1: Preparación
```sql
-- 1. Crear políticas permisivas
CREATE POLICY "temp_allow_all" ON tu_tabla
FOR ALL USING (true);

-- 2. Activar RLS
ALTER TABLE tu_tabla ENABLE ROW LEVEL SECURITY;

-- 3. Verificar que todo funciona
```

### Fase 2: Restricción gradual
```sql
-- 1. Agregar columna user_id si no existe
ALTER TABLE tu_tabla ADD COLUMN user_id UUID;

-- 2. Actualizar datos existentes
UPDATE tu_tabla SET user_id = 'default-uuid' WHERE user_id IS NULL;

-- 3. Crear nuevas políticas restrictivas
-- 4. Eliminar políticas permisivas
```

## 🔐 Mejores Prácticas

1. **Siempre activa RLS** en tablas con datos sensibles
2. **Empieza permisivo**, luego restringe gradualmente
3. **Documenta tus políticas** con nombres descriptivos
4. **Prueba exhaustivamente** antes de producción
5. **Monitorea logs** para detectar accesos denegados
6. **Usa roles** para simplificar políticas complejas
7. **Revisa periódicamente** las políticas activas

## 📊 Plantilla de Políticas

```sql
-- ========== PLANTILLA RLS COMPLETA ==========
-- 1. Activar RLS
ALTER TABLE mi_tabla ENABLE ROW LEVEL SECURITY;

-- 2. Política: Lectura pública
CREATE POLICY "public_read" ON mi_tabla
FOR SELECT USING (true);

-- 3. Política: Crear solo autenticados
CREATE POLICY "auth_create" ON mi_tabla
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Política: Actualizar solo propios
CREATE POLICY "update_own" ON mi_tabla
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Política: Eliminar solo propios
CREATE POLICY "delete_own" ON mi_tabla
FOR DELETE USING (user_id = auth.uid());

-- 6. Política: Admins todo
CREATE POLICY "admin_all" ON mi_tabla
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);
```

## 🆘 Comandos de Emergencia

```sql
-- Desactivar RLS (desarrollo únicamente)
ALTER TABLE tu_tabla DISABLE ROW LEVEL SECURITY;

-- Ver todas las políticas
SELECT * FROM pg_policies WHERE tablename = 'tu_tabla';

-- Eliminar política específica
DROP POLICY "nombre_politica" ON tu_tabla;

-- Eliminar TODAS las políticas
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'tu_tabla'
    LOOP
        EXECUTE 'DROP POLICY ' || quote_ident(pol.policyname) || ' ON tu_tabla';
    END LOOP;
END $$;
```

## 📚 Recursos

- [Documentación oficial PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Guía RLS de Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

**Recuerda**: RLS es tu primera línea de defensa. Úsalo SIEMPRE en producción.

**Creado para**: Proyectos Supabase con seguridad
**Última actualización**: Junio 2025
**Autor**: xuli70