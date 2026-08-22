DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;

REVOKE SELECT ON public.profiles FROM anon;

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);