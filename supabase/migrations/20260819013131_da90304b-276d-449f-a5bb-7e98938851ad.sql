-- Fix existing security linter warnings for pre-existing functions
ALTER FUNCTION public.track_daily_login(uuid) SET search_path = public;
ALTER FUNCTION public.increment_mission_progress(uuid, public.mission_type, integer) SET search_path = public;

-- Revoke execute from public for security definer functions
REVOKE EXECUTE ON FUNCTION public.track_daily_login(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_mission_progress(uuid, public.mission_type, integer) FROM PUBLIC, authenticated;

-- Grant to service_role
GRANT EXECUTE ON FUNCTION public.track_daily_login(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_mission_progress(uuid, public.mission_type, integer) TO service_role;
