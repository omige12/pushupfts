ALTER FUNCTION public.track_daily_login(uuid) SET search_path = public;

REVOKE ALL ON FUNCTION public.track_daily_login(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.increment_mission_progress(uuid, mission_type, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.track_daily_login(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_mission_progress(uuid, mission_type, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.generate_numeric_player_id() FROM anon, public;
REVOKE ALL ON FUNCTION public.set_player_id_trigger() FROM anon, public;