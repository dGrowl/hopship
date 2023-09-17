DROP TRIGGER IF EXISTS enforce_identity_limit ON public.identities;

DROP FUNCTION IF EXISTS enforce_identity_limit;

CREATE OR REPLACE FUNCTION enforce_identity_limit()
RETURNS TRIGGER AS $$
	DECLARE
		n_identities INTEGER;
	BEGIN
		SELECT INTO n_identities COUNT(*)
		FROM public.identities i
		WHERE i.user_id = NEW.user_id;

		IF n_identities >= 6 THEN
			RAISE EXCEPTION 'IDENTITY_LIMIT_REACHED';
		END IF;

		RETURN NEW;
	END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER enforce_identity_limit
	BEFORE INSERT ON public.identities
	FOR EACH ROW EXECUTE FUNCTION enforce_identity_limit();
