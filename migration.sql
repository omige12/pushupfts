-- 1. Create Friendships table
CREATE TABLE public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- 2. Create Challenges table
CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenged_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    duration INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add online status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenges TO authenticated;
GRANT ALL ON public.challenges TO service_role;

-- 5. Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- 6. Policies for Friendships
CREATE POLICY "Users can view their own friendships"
    ON public.friendships FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friendship requests"
    ON public.friendships FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their received friendship requests"
    ON public.friendships FOR UPDATE
    TO authenticated
    USING (auth.uid() = friend_id OR auth.uid() = user_id);

-- 7. Policies for Challenges
CREATE POLICY "Users can view their own challenges"
    ON public.challenges FOR SELECT
    TO authenticated
    USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can send challenges"
    ON public.challenges FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update their received challenges"
    ON public.challenges FOR UPDATE
    TO authenticated
    USING (auth.uid() = challenged_id OR auth.uid() = challenger_id);

-- 8. Unique Player ID constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_player_id_key'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_player_id_key UNIQUE (player_id);
    END IF;
END
$$;
