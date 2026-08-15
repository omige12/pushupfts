
CREATE OR REPLACE FUNCTION public.increment_mission_progress(
    p_user_id UUID,
    p_type mission_type,
    p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.daily_missions
    SET current_progress = current_progress + p_amount
    WHERE user_id = p_user_id 
      AND type = p_type 
      AND mission_date = CURRENT_DATE
      AND claimed = FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_mission_progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_mission_progress TO service_role;
