-- Ensure RLS is enabled
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches_v2 ENABLE ROW LEVEL SECURITY;

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches_v2 TO authenticated;

GRANT ALL ON public.friendships TO service_role;
GRANT ALL ON public.challenges TO service_role;
GRANT ALL ON public.matches_v2 TO service_role;

-- Friendship Policies
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.friendships;
CREATE POLICY "Users can view their own friendships" 
ON public.friendships FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can insert friendship requests" ON public.friendships;
CREATE POLICY "Users can insert friendship requests" 
ON public.friendships FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their received friendship requests" ON public.friendships;
CREATE POLICY "Users can update their received friendship requests" 
ON public.friendships FOR UPDATE 
TO authenticated 
USING (auth.uid() = friend_id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their friendships" ON public.friendships;
CREATE POLICY "Users can delete their friendships" 
ON public.friendships FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Challenge Policies
DROP POLICY IF EXISTS "Users can view challenges involving them" ON public.challenges;
CREATE POLICY "Users can view challenges involving them" 
ON public.challenges FOR SELECT 
TO authenticated 
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

DROP POLICY IF EXISTS "Users can insert challenges" ON public.challenges;
CREATE POLICY "Users can insert challenges" 
ON public.challenges FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = challenger_id);

DROP POLICY IF EXISTS "Users can update challenges involving them" ON public.challenges;
CREATE POLICY "Users can update challenges involving them" 
ON public.challenges FOR UPDATE 
TO authenticated 
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Match V2 Policies
DROP POLICY IF EXISTS "Users can view matches they are in" ON public.matches_v2;
CREATE POLICY "Users can view matches they are in" 
ON public.matches_v2 FOR SELECT 
TO authenticated 
USING (auth.uid() = player_1 OR auth.uid() = player_2);

DROP POLICY IF EXISTS "Users can insert matches" ON public.matches_v2;
CREATE POLICY "Users can insert matches" 
ON public.matches_v2 FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = player_1);

DROP POLICY IF EXISTS "Users can update matches they are in" ON public.matches_v2;
CREATE POLICY "Users can update matches they are in" 
ON public.matches_v2 FOR UPDATE 
TO authenticated 
USING (auth.uid() = player_1 OR auth.uid() = player_2);