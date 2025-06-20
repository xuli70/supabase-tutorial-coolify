-- =====================================================
-- SCRIPT DE PRUEBAS PARA VERIFICAR RLS
-- =====================================================
-- Ejecuta estas consultas para verificar que RLS funciona

-- 1. VERIFICAR QUE RLS ESTÁ ACTIVADO
SELECT 
    tablename,
    rowsecurity as "RLS Activado"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tutorial_tasks';

-- 2. VER TODAS LAS POLÍTICAS ACTIVAS
SELECT 
    pol.polname as "Nombre de Política",
    CASE pol.polcmd 
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE 'ALL'
    END as "Operación",
    pol.polpermissive as "Es Permisiva",
    pg_get_expr(pol.polqual, pol.polrelid) as "Condición USING",
    pg_get_expr(pol.polwithcheck, pol.polrelid) as "Condición CHECK"
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'tutorial_tasks'
ORDER BY pol.polname;

-- 3. SIMULAR ACCESO COMO USUARIO ANÓNIMO
-- Esto es lo que ve tu aplicación sin autenticación
SET ROLE anon;
SELECT current_user;

-- Intentar operaciones básicas
SELECT COUNT(*) as "Total tareas visibles" FROM tutorial_tasks;
SELECT id, title, status FROM tutorial_tasks LIMIT 5;

-- Volver a rol de administrador
RESET ROLE;

-- 4. PROBAR INSERCIÓN CON RLS
-- Primero como admin (debería funcionar)
INSERT INTO tutorial_tasks (title, description, status, priority)
VALUES ('Tarea de prueba RLS', 'Probando Row Level Security', 'pendiente', 3)
RETURNING id, title;

-- 5. VERIFICAR LOGS DE POLÍTICAS
-- Útil para debugging
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies
WHERE tablename = 'tutorial_tasks';

-- 6. PRUEBA DE RENDIMIENTO CON RLS
-- Comparar tiempos de consulta
EXPLAIN ANALYZE
SELECT * FROM tutorial_tasks
WHERE status = 'pendiente'
LIMIT 10;

-- =====================================================
-- CONSULTAS ÚTILES PARA MONITOREO
-- =====================================================

-- Ver qué rol está usando la sesión actual
SELECT current_user, session_user;

-- Ver todos los roles disponibles
SELECT rolname FROM pg_roles WHERE rolname LIKE '%supabase%' OR rolname LIKE '%anon%';

-- Estadísticas de la tabla
SELECT 
    schemaname,
    tablename,
    n_live_tup as "Filas activas",
    n_dead_tup as "Filas eliminadas",
    last_vacuum as "Último vacuum",
    last_analyze as "Último analyze"
FROM pg_stat_user_tables
WHERE tablename = 'tutorial_tasks';

-- =====================================================
-- COMANDOS DE EMERGENCIA
-- =====================================================

-- Si necesitas DESACTIVAR RLS temporalmente
-- ALTER TABLE tutorial_tasks DISABLE ROW LEVEL SECURITY;

-- Si necesitas ELIMINAR todas las políticas
-- DROP POLICY IF EXISTS "tutorial_tasks_select_all" ON tutorial_tasks;
-- DROP POLICY IF EXISTS "tutorial_tasks_insert_all" ON tutorial_tasks;
-- DROP POLICY IF EXISTS "tutorial_tasks_update_all" ON tutorial_tasks;
-- DROP POLICY IF EXISTS "tutorial_tasks_delete_all" ON tutorial_tasks;

-- Para hacer bypass de RLS (solo como superadmin)
-- ALTER TABLE tutorial_tasks FORCE ROW LEVEL SECURITY;