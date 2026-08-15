
-- Check if tables already exist to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'mission_type') THEN
        CREATE TYPE public.mission_type AS ENUM ('pushups', 'battles', 'wins', 'xp', 'login', 'matches');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.daily_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    last_claimed_at TIMESTAMP WITH TIME ZONE,
    streak_count INTEGER DEFAULT 0 NOT NULL,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.daily_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type mission_type NOT NULL,
    title TEXT NOT NULL,
    goal INTEGER NOT NULL,
    current_progress INTEGER DEFAULT 0 NOT NULL,
    xp_reward INTEGER DEFAULT 0 NOT NULL,
    claimed BOOLEAN DEFAULT FALSE NOT NULL,
    mission_date DATE DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE(user_id, type, mission_date)
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_rewards TO authenticated;
GRANT ALL ON public.daily_rewards TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_missions TO authenticated;
GRANT ALL ON public.daily_missions TO service_role;

-- RLS
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;

-- Policies for daily_rewards
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own rewards') THEN
        CREATE POLICY "Users can view their own rewards" ON public.daily_rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update their own rewards') THEN
        CREATE POLICY "Users can update their own rewards" ON public.daily_rewards FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can insert their own rewards') THEN
        CREATE POLICY "Users can insert their own rewards" ON public.daily_rewards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Policies for daily_missions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own missions') THEN
        CREATE POLICY "Users can view their own missions" ON public.daily_missions FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update their own missions') THEN
        CREATE POLICY "Users can update their own missions" ON public.daily_missions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can insert their own missions') THEN
        CREATE POLICY "Users can insert their own missions" ON public.daily_missions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;
