DROP VIEW IF EXISTS public.public_profiles;

CREATE OR REPLACE FUNCTION public.search_player(_player_id text)
RETURNS TABLE (
  id uuid, player_id text, name text, avatar_url text, level integer,
  xp bigint, record integer, wins integer, losses integer, streak integer, last_seen_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.player_id, p.name, p.avatar_url, p.level, p.xp, p.record, p.wins, p.losses, p.streak, p.last_seen_at
  FROM public.profiles p
  WHERE p.player_id = _player_id
    AND auth.uid() IS NOT NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_public_profile(_id uuid)
RETURNS TABLE (
  id uuid, player_id text, name text, avatar_url text, level integer,
  xp bigint, record integer, wins integer, losses integer, streak integer, last_seen_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.player_id, p.name, p.avatar_url, p.level, p.xp, p.record, p.wins, p.losses, p.streak, p.last_seen_at
  FROM public.profiles p
  WHERE p.id = _id
    AND auth.uid() IS NOT NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_ranking(_ids uuid[] DEFAULT NULL, _limit integer DEFAULT 100)
RETURNS TABLE (
  id uuid, player_id text, name text, avatar_url text, level integer,
  xp bigint, record integer, wins integer, streak integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.player_id, p.name, p.avatar_url, p.level, p.xp, p.record, p.wins, p.streak
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND (_ids IS NULL OR p.id = ANY(_ids))
  ORDER BY p.xp DESC
  LIMIT LEAST(COALESCE(_limit, 100), 100);
$$;

REVOKE ALL ON FUNCTION public.search_player(text) FROM public, anon;
REVOKE ALL ON FUNCTION public.get_public_profile(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.get_ranking(uuid[], integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.search_player(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_ranking(uuid[], integer) TO authenticated, service_role;