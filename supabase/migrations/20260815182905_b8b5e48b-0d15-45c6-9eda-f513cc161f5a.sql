-- Add last_login_at to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_login_at') THEN
        ALTER TABLE public.profiles ADD COLUMN last_login_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Ensure missions handle 'login' type correctly
-- We'll just make sure the profile update trigger or a direct call can handle it.
-- We can add a simple function to handle daily login mission.

CREATE OR REPLACE FUNCTION public.track_daily_login(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last login
  UPDATE public.profiles 
  SET last_login_at = now() 
  WHERE id = user_id_param;

  -- Trigger mission progress for login
  PERFORM public.increment_mission_progress(user_id_param, 'login', 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_daily_login(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_daily_login(uuid) TO service_role;
