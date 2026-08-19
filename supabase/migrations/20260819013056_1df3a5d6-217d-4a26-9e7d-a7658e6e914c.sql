-- Explicitly set functions to SECURITY INVOKER to satisfy linter
ALTER FUNCTION public.generate_unique_player_id() SECURITY INVOKER;
ALTER FUNCTION public.set_player_id() SECURITY INVOKER;

-- Just in case, try revoking again with a different syntax or ensure it's applied to the right roles
REVOKE ALL ON FUNCTION public.generate_unique_player_id() FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.set_player_id() FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_unique_player_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_player_id() TO service_role;
