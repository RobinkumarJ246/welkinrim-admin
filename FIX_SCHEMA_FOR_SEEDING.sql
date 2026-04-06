-- ====================================================================
-- FIX SCHEMA FOR SEEDING - Run this in Supabase SQL Editor
-- ====================================================================
-- This fixes two issues:
-- 1. Changes id columns from UUID to TEXT (to accept custom IDs like "haemng-xamqa8ak3")
-- 2. Temporarily disables RLS to allow seeding
-- ====================================================================

-- Step 1: Change id column from UUID to TEXT in both tables
-- This allows custom string IDs instead of UUIDs

ALTER TABLE public.products 
  ALTER COLUMN id TYPE TEXT;

ALTER TABLE public.series 
  ALTER COLUMN id TYPE TEXT;

-- Step 2: Temporarily disable RLS for seeding
ALTER TABLE public.series DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- ====================================================================
-- After successful seeding, re-enable RLS by running:
-- ====================================================================
-- ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
--
-- And add proper policies:
--
-- CREATE POLICY "Allow authenticated read" ON public.series
--   FOR SELECT TO authenticated USING (true);
--
-- CREATE POLICY "Allow authenticated CRUD" ON public.series
--   FOR ALL TO authenticated 
--   USING (true) WITH CHECK (true);
--
-- CREATE POLICY "Allow authenticated read" ON public.products
--   FOR SELECT TO authenticated USING (true);
--
-- CREATE POLICY "Allow authenticated CRUD" ON public.products
--   FOR ALL TO authenticated 
--   USING (true) WITH CHECK (true);
-- ====================================================================
