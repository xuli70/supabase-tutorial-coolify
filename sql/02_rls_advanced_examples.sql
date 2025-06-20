-- =====================================================
-- POLÍTICAS RLS NIVEL 2 - Solo usuarios autenticados
-- =====================================================
-- IMPORTANTE: Estas políticas requieren autenticación de Supabase
-- NO las apliques hasta tener auth implementado o la app dejará de funcionar

-- Primero, eliminar las políticas permisivas anteriores
DROP POLICY IF EXISTS "tutorial_tasks_select_all" ON tutorial_tasks;
DROP POLICY IF EXISTS "tutorial_tasks_insert_all" ON tutorial_tasks;
DROP POLICY IF EXISTS "tutorial_tasks_update_all" ON tutorial_tasks;
DROP POLICY IF EXISTS "tutorial_tasks_delete_all" ON tutorial_tasks;

-- NIVEL 2: Solo usuarios autenticados pueden interactuar

-- Todos los autenticados pueden leer todas las tareas
CREATE POLICY "tutorial_tasks_select_authenticated" 
ON tutorial_tasks 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Solo autenticados pueden crear tareas
CREATE POLICY "tutorial_tasks_insert_authenticated" 
ON tutorial_tasks 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Solo autenticados pueden actualizar
CREATE POLICY "tutorial_tasks_update_authenticated" 
ON tutorial_tasks 
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Solo autenticados pueden eliminar
CREATE POLICY "tutorial_tasks_delete_authenticated" 
ON tutorial_tasks 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS RLS NIVEL 3 - Control por usuario
-- =====================================================
-- Requiere agregar columna user_id a la tabla

-- 1. Agregar columna user_id (si no existe)
ALTER TABLE tutorial_tasks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Actualizar tareas existentes con un user_id de prueba (opcional)
-- UPDATE tutorial_tasks SET user_id = 'UUID-DE-USUARIO-PRUEBA' WHERE user_id IS NULL;

-- 3. Eliminar políticas anteriores
DROP POLICY IF EXISTS "tutorial_tasks_select_authenticated" ON tutorial_tasks;
DROP POLICY IF EXISTS "tutorial_tasks_insert_authenticated" ON tutorial_tasks;
DROP POLICY IF EXISTS "tutorial_tasks_update_authenticated" ON tutorial_tasks;
DROP POLICY IF EXISTS "tutorial_tasks_delete_authenticated" ON tutorial_tasks;

-- 4. Crear políticas basadas en propiedad

-- Los usuarios pueden ver sus propias tareas
CREATE POLICY "tutorial_tasks_select_own" 
ON tutorial_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Los usuarios solo pueden crear tareas para sí mismos
CREATE POLICY "tutorial_tasks_insert_own" 
ON tutorial_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propias tareas
CREATE POLICY "tutorial_tasks_update_own" 
ON tutorial_tasks 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propias tareas
CREATE POLICY "tutorial_tasks_delete_own" 
ON tutorial_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS MIXTAS - Ejemplos avanzados
-- =====================================================

-- Ejemplo 1: Tareas públicas y privadas
-- Agregar columna is_public
ALTER TABLE tutorial_tasks 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Política: Ver tareas propias O públicas
CREATE POLICY "tutorial_tasks_select_own_or_public" 
ON tutorial_tasks 
FOR SELECT 
USING (
    auth.uid() = user_id 
    OR is_public = true
);

-- Ejemplo 2: Roles de administrador
-- Los admins pueden ver todo
CREATE POLICY "tutorial_tasks_admin_all" 
ON tutorial_tasks 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Ejemplo 3: Compartir con equipos
-- Agregar tabla de permisos
CREATE TABLE IF NOT EXISTS task_permissions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tutorial_tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    permission_type VARCHAR(20) CHECK (permission_type IN ('read', 'write', 'delete')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Política para tareas compartidas
CREATE POLICY "tutorial_tasks_shared_read" 
ON tutorial_tasks 
FOR SELECT 
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM task_permissions 
        WHERE task_permissions.task_id = tutorial_tasks.id 
        AND task_permissions.user_id = auth.uid()
        AND task_permissions.permission_type IN ('read', 'write')
    )
);