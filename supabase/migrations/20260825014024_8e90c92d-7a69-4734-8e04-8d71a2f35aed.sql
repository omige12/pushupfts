DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = off) AS
SELECT id, player_id, name, avatar_url, level, xp, wins, losses, record, total_pushups, streak, achievements, last_seen_at
FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO service_role;