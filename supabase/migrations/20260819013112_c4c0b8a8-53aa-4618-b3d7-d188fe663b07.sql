-- Final attempt to fix linter issues
-- Set search_path and revokes to satisfy linter for trigger functions

ALTER FUNCTION public.generate_unique_player_id() 
  SECURITY INVOKER 
  SET search_path = public;

ALTER FUNCTION public.set_player_id() 
  SECURITY INVOKER 
  SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.generate_unique_player_id() FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_player_id() FROM PUBLIC, authenticated;

-- Service role is usually enough for system-level triggers
GRANT EXECUTE ON FUNCTION public.generate_unique_player_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_player_id() TO service_role;
