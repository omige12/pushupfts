
-- Allow users to see each other's public profile info
DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;
CREATE POLICY "Profiles are public" 
ON public.profiles FOR SELECT 
USING (true);

-- Allow creating challenges
DROP POLICY IF EXISTS "Users can create challenges" ON public.challenges;
CREATE POLICY "Users can create challenges"
ON public.challenges FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = (SELECT id FROM public.profiles WHERE id = challenger_id));

-- Allow users to see challenges they are involved in
DROP POLICY IF EXISTS "Users can see their challenges" ON public.challenges;
CREATE POLICY "Users can see their challenges"
ON public.challenges FOR SELECT
TO authenticated
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Allow updating challenges (to accept/reject)
DROP POLICY IF EXISTS "Users can update their challenges" ON public.challenges;
CREATE POLICY "Users can update their challenges"
ON public.challenges FOR UPDATE
TO authenticated
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Allow matches_v2 visibility
DROP POLICY IF EXISTS "Matches are visible to participants" ON public.matches_v2;
CREATE POLICY "Matches are visible to participants"
ON public.matches_v2 FOR SELECT
TO authenticated
USING (auth.uid() = player_1 OR auth.uid() = player_2);

DROP POLICY IF EXISTS "Participants can update match progress" ON public.matches_v2;
CREATE POLICY "Participants can update match progress"
ON public.matches_v2 FOR UPDATE
TO authenticated
USING (auth.uid() = player_1 OR auth.uid() = player_2);

-- Enable Realtime for relevant tables
ALTER TABLE public.challenges REPLICA IDENTITY FULL;
ALTER TABLE public.matches_v2 REPLICA IDENTITY FULL;

-- Ensure grants are in place
GRANT ALL ON TABLE public.challenges TO authenticated;
GRANT ALL ON TABLE public.challenges TO service_role;
GRANT ALL ON TABLE public.matches_v2 TO authenticated;
GRANT ALL ON TABLE public.matches_v2 TO service_role;
