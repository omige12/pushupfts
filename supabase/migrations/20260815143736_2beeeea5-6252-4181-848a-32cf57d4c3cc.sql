CREATE OR REPLACE FUNCTION generate_numeric_player_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    done BOOLEAN := FALSE;
BEGIN
    LOOP
        -- Generate 8 random digits
        new_id := floor(random() * 90000000 + 10000000)::TEXT;
        
        -- Check if it exists
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE player_id = new_id) THEN
            RETURN new_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_player_id_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.player_id IS NULL OR NEW.player_id !~ '^\d{8}$' THEN
        NEW.player_id := generate_numeric_player_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_player_id ON public.profiles;
CREATE TRIGGER ensure_player_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION set_player_id_trigger();

UPDATE public.profiles
SET player_id = generate_numeric_player_id()
WHERE player_id IS NULL OR player_id !~ '^\d{8}$';
