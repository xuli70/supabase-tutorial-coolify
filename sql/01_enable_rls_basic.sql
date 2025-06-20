-- =====================================================
-- ACTIVAR ROW LEVEL SECURITY (RLS) EN tutorial_tasks
-- =====================================================
-- Este script activa RLS con políticas básicas permisivas
-- para mantener la funcionalidad actual de la aplicación

-- 1. ACTIVAR RLS EN LA TABLA
-- Esto bloquea TODO el acceso por defecto hasta que creemos políticas
ALTER TABLE tutorial_tasks ENABLE ROW LEVEL SECURITY;

-- 2. CREAR POLÍTICAS PERMISIVAS (Nivel 1 - Básico)
-- Estas políticas mantienen el comportamiento actual pero con RLS activado

-- Política para SELECT (Lectura)
-- Permite que todos puedan leer todas las tareas
CREATE POLICY "tutorial_tasks_select_all" 
ON tutorial_tasks 
FOR SELECT 
USING (true);

-- Política para INSERT (Crear)
-- Permite que todos puedan crear nuevas tareas
CREATE POLICY "tutorial_tasks_insert_all" 
ON tutorial_tasks 
FOR INSERT 
WITH CHECK (true);

-- Política para UPDATE (Actualizar)
-- Permite que todos puedan actualizar cualquier tarea
CREATE POLICY "tutorial_tasks_update_all" 
ON tutorial_tasks 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Política para DELETE (Eliminar)
-- Permite que todos puedan eliminar cualquier tarea
CREATE POLICY "tutorial_tasks_delete_all" 
ON tutorial_tasks 
FOR DELETE 
USING (true);

-- 3. VERIFICAR QUE RLS ESTÁ ACTIVADO
-- Puedes ejecutar esta consulta para confirmar
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'tutorial_tasks';

-- 4. VER TODAS LAS POLÍTICAS CREADAS
-- Útil para verificar que se crearon correctamente
SELECT 
    pol.polname as policy_name,
    pol.polcmd as command,
    pol.polpermissive as permissive,
    pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as check_expression
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'tutorial_tasks';

-- =====================================================
-- NOTA IMPORTANTE:
-- =====================================================
-- Este es el NIVEL 1 de seguridad: RLS activado pero permisivo
-- La aplicación funcionará exactamente igual que antes
-- pero ahora tienes la base para implementar políticas más restrictivas

-- Para DESACTIVAR RLS (si necesitas volver atrás):
-- ALTER TABLE tutorial_tasks DISABLE ROW LEVEL SECURITY;

-- Para ELIMINAR una política específica:
-- DROP POLICY "tutorial_tasks_select_all" ON tutorial_tasks;