ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS match_id text;
COMMENT ON COLUMN public.challenges.match_id IS 'UUID/ID of the match created in matches_v2 when this challenge is accepted.';