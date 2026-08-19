-- Fix Security Linter Warnings

-- 1. Fix search_path for functions
ALTER FUNCTION public.generate_unique_player_id() SET search_path = public;
ALTER FUNCTION public.set_player_id() SET search_path = public;

-- 2. Revoke execute from public/authenticated if they shouldn't call them directly
-- These are meant for triggers, so authenticated users don't need direct execute access.
REVOKE EXECUTE ON FUNCTION public.generate_unique_player_id() FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_player_id() FROM PUBLIC, authenticated;

-- Ensure service_role can still use them (triggers usually run as the user but we want to be safe)
GRANT EXECUTE ON FUNCTION public.generate_unique_player_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_player_id() TO service_role;
