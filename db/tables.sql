DROP TABLE IF EXISTS public.unverified_identities;

DROP TABLE IF EXISTS public.identities;

DROP TABLE IF EXISTS public.platforms;

DROP TABLE IF EXISTS public.users;

CREATE TABLE public.users (
	id       INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name     TEXT UNIQUE NOT NULL,
	email    TEXT UNIQUE NOT NULL,
	passhash TEXT NOT NULL,
	CONSTRAINT user_name_is_lower CHECK (name = LOWER(name)),
	CONSTRAINT user_name_proper_chars CHECK (name ~ '^\w+$'),
	CONSTRAINT user_name_min_length CHECK (char_length(name) >= 1),
	CONSTRAINT user_name_max_length CHECK (char_length(name) <= 24),
	CONSTRAINT email_proper_chars CHECK (email ~ '^.+@.+$'),
	CONSTRAINT email_min_length CHECK (char_length(email) >= 3),
	CONSTRAINT email_max_length CHECK (char_length(email) <= 256),
	CONSTRAINT passhash_proper_algorithm CHECK (passhash LIKE '$argon2id$%')
);

CREATE TABLE public.platforms (
	name TEXT PRIMARY KEY,
	CONSTRAINT platform_proper_chars CHECK (name ~ '^[a-zA-Z]+$')
);

CREATE TABLE public.identities (
	user_id     INTEGER REFERENCES public.users (id) ON DELETE CASCADE,
	platform    TEXT REFERENCES public.platforms (name) ON DELETE CASCADE,
	name        TEXT NOT NULL,
	description TEXT NOT NULL,
	PRIMARY KEY (platform, name),
	CONSTRAINT platform_name_proper_chars CHECK (name ~ '^\w+$'),
	CONSTRAINT platform_name_min_length CHECK (char_length(name) >= 1),
	CONSTRAINT platform_name_max_length CHECK (char_length(name) <= 24),
	CONSTRAINT description_proper_chars CHECK (description ~ '^[a-zA-Z\d;:''" \.\+\-\*\/\&]*$'),
	CONSTRAINT description_max_length CHECK (char_length(description) <= 48)
);

-- Matches public.identities, but primary key includes user_id
CREATE TABLE public.unverified_identities (
	user_id     INTEGER REFERENCES public.users (id) ON DELETE CASCADE,
	platform    TEXT REFERENCES public.platforms (name) ON DELETE CASCADE,
	name        TEXT NOT NULL,
	description TEXT NOT NULL,
	PRIMARY KEY (user_id, platform, name),
	CONSTRAINT platform_name_proper_chars CHECK (name ~ '^\w+$'),
	CONSTRAINT platform_name_min_length CHECK (char_length(name) >= 1),
	CONSTRAINT platform_name_max_length CHECK (char_length(name) <= 24),
	CONSTRAINT description_proper_chars CHECK (description ~ '^[a-zA-Z\d;:''" \.\+\-\*\/\&]*$'),
	CONSTRAINT description_max_length CHECK (char_length(description) <= 48)
);
