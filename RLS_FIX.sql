-- RLS Policy Fix for Seeding
-- Run this in Supabase SQL Editor if you get RLS policy errors during seeding

-- Option 1: Temporarily disable RLS (recommended for initial seed)
ALTER TABLE public.series DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- After seeding, re-enable RLS:
-- ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Option 2: Add policies that allow service role to bypass (better approach)
-- CREATE POLICY "Service role bypass" ON public.series
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Service role bypass" ON public.products
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- Option 3: Add policy for authenticated users (if using anon key with auth)
-- CREATE POLICY "Allow authenticated insert series" ON public.series
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- CREATE POLICY "Allow authenticated insert products" ON public.products
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);
