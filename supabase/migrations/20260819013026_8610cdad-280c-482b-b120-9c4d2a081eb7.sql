-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES: Garantir estrutura correta
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'player_id') THEN
        ALTER TABLE public.profiles ADD COLUMN player_id text UNIQUE;
    END IF;
END $$;

-- Função para gerar player_id no formato FB-XXXXXX
CREATE OR REPLACE FUNCTION generate_unique_player_id()
RETURNS text AS $$
DECLARE
    new_id text;
    done bool;
BEGIN
    done := false;
    WHILE NOT done LOOP
        new_id := 'FB-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6));
        SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE player_id = new_id) INTO done;
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Trigger para definir player_id automaticamente
CREATE OR REPLACE FUNCTION set_player_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.player_id IS NULL OR NEW.player_id NOT LIKE 'FB-%' THEN
        NEW.player_id := generate_unique_player_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_player_id ON public.profiles;
CREATE TRIGGER tr_set_player_id
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_player_id();

-- 2. MATCHES (1v1 Multiplayer)
CREATE TABLE IF NOT EXISTS public.matches_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_1 uuid REFERENCES public.profiles(id) NOT NULL,
    player_2 uuid REFERENCES public.profiles(id),
    status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'accepted', 'active', 'finished', 'cancelled')),
    player_1_reps integer DEFAULT 0,
    player_2_reps integer DEFAULT 0,
    winner_id uuid REFERENCES public.profiles(id),
    started_at timestamp with time zone,
    finished_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. MATCH INVITES
CREATE TABLE IF NOT EXISTS public.match_invites_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES public.profiles(id) NOT NULL,
    receiver_id uuid REFERENCES public.profiles(id) NOT NULL,
    match_id uuid REFERENCES public.matches_v2(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS e Configurar Permissões
ALTER TABLE public.matches_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_invites_v2 ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.matches_v2 TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.match_invites_v2 TO authenticated;
GRANT ALL ON public.matches_v2 TO service_role;
GRANT ALL ON public.match_invites_v2 TO service_role;

-- POLICIES: MATCHES
CREATE POLICY "Users can view matches they participate in" ON public.matches_v2 FOR SELECT TO authenticated 
USING (auth.uid() = player_1 OR auth.uid() = player_2);

CREATE POLICY "Users can create matches" ON public.matches_v2 FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = player_1);

CREATE POLICY "Users can update their matches" ON public.matches_v2 FOR UPDATE TO authenticated 
USING (auth.uid() = player_1 OR auth.uid() = player_2);

-- POLICIES: MATCH INVITES
CREATE POLICY "Users can view invites they sent or received" ON public.match_invites_v2 FOR SELECT TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send invites" ON public.match_invites_v2 FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update invites" ON public.match_invites_v2 FOR UPDATE TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
