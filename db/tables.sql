DROP TABLE IF EXISTS public.unverified_identities;

DROP TABLE IF EXISTS public.identities;

DROP TABLE IF EXISTS public.platforms;

DROP TABLE IF EXISTS public.users;

CREATE TABLE public.users (
	id       INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name     TEXT UNIQUE NOT NULL,
	email    TEXT UNIQUE NOT NULL,
	passhash TEXT NOT NULL,
	CONSTRAINT user_name_is_lower CHECK (name = LOWER(name))
);

CREATE TABLE public.platforms (
	name TEXT PRIMARY KEY
);

CREATE TABLE public.identities (
	user_id     INTEGER REFERENCES public.users (id) ON DELETE CASCADE,
	platform    TEXT REFERENCES public.platforms (name) ON DELETE CASCADE,
	name        TEXT NOT NULL,
	description TEXT NOT NULL,
	PRIMARY KEY (platform, name)
);

-- Columns match public.identities, but primary key includes user_id
CREATE TABLE public.unverified_identities (
	user_id     INTEGER REFERENCES public.users (id) ON DELETE CASCADE,
	platform    TEXT REFERENCES public.platforms (name) ON DELETE CASCADE,
	name        TEXT NOT NULL,
	description TEXT NOT NULL,
	PRIMARY KEY (user_id, platform, name)
);
