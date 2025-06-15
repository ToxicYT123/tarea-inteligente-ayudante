
-- Primero, vamos a simplificar las políticas de la base de datos para que no requieran autenticación
-- Eliminar las políticas RLS existentes y hacer las tablas públicas para tu uso personal

-- Deshabilitar RLS en todas las tablas para acceso directo
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_contexts DISABLE ROW LEVEL SECURITY;

-- Eliminar cualquier política existente (si las hay)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.tasks;
DROP POLICY IF EXISTS "Enable update for all users" ON public.tasks;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.tasks;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.attachments;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.attachments;
DROP POLICY IF EXISTS "Enable update for all users" ON public.attachments;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.attachments;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.academic_contexts;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.academic_contexts;
DROP POLICY IF EXISTS "Enable update for all users" ON public.academic_contexts;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.academic_contexts;
