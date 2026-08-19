CREATE OR REPLACE FUNCTION public.increment_mission_progress(p_user_id uuid, p_type mission_type, p_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    UPDATE public.daily_missions
    SET current_progress = current_progress + p_amount
    WHERE user_id = p_user_id
      AND type = p_type
      AND mission_date = CURRENT_DATE
      AND claimed = FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_daily_login(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> user_id_param THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.profiles
  SET last_login_at = now()
  WHERE id = user_id_param;

  PERFORM public.increment_mission_progress(user_id_param, 'login', 1);
END;
$$;

REVOKE ALL ON FUNCTION public.track_daily_login(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.increment_mission_progress(uuid, mission_type, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.track_daily_login(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_mission_progress(uuid, mission_type, integer) TO authenticated;