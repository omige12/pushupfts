
-- Fix enum and table constraints for the new onboarding flow
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fitness_goal') THEN
    CREATE TYPE public.fitness_goal AS ENUM (
      'Melhorar minhas flexões', 
      'Bater recordes', 
      'Vencer outras pessoas', 
      'Chegar ao topo do ranking'
    );
  ELSE
    -- Try to add new values if they don't exist
    ALTER TYPE public.fitness_goal ADD VALUE IF NOT EXISTS 'Melhorar minhas flexões';
    ALTER TYPE public.fitness_goal ADD VALUE IF NOT EXISTS 'Bater recordes';
    ALTER TYPE public.fitness_goal ADD VALUE IF NOT EXISTS 'Vencer outras pessoas';
    ALTER TYPE public.fitness_goal ADD VALUE IF NOT EXISTS 'Chegar ao topo do ranking';
  END IF;
END $$;

-- Update profiles table to include new onboarding fields if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS quiz_responses JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_duration INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS motivation TEXT;

-- Ensure RLS is enabled and policies allow authenticated users to manage their own profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can select own profile'
  ) THEN
    CREATE POLICY "Users can select own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);
  END IF;
END $$;

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
