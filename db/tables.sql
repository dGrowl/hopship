DROP TABLE IF EXISTS public.identities;
DROP TABLE IF EXISTS public.platforms;
DROP TABLE IF EXISTS public.users;

DROP DOMAIN IF EXISTS IDENTITY_DESCRIPTION_TEXT;
DROP DOMAIN IF EXISTS IDENTITY_NAME_TEXT;

DROP TYPE IF EXISTS VERIFICATION_STATUS;

DROP EXTENSION IF EXISTS citext;

CREATE EXTENSION citext;

CREATE TYPE VERIFICATION_STATUS AS ENUM ('UNVERIFIED', 'PENDING', 'REJECTED', 'VERIFIED');

CREATE DOMAIN IDENTITY_NAME_TEXT AS CITEXT
	CONSTRAINT platform_name_proper_chars CHECK (VALUE ~ '^\w+$')
	CONSTRAINT platform_name_min_length CHECK (char_length(VALUE) >= 1)
	CONSTRAINT platform_name_max_length CHECK (char_length(VALUE) <= 24);

CREATE DOMAIN IDENTITY_DESCRIPTION_TEXT AS TEXT
	CONSTRAINT description_proper_chars CHECK (
		VALUE ~ '^[a-zA-Z\d,;:''" \.\+\-\*\/\&%()?!]*$'
	)
	CONSTRAINT description_max_length CHECK (char_length(VALUE) <= 48);

CREATE TABLE public.users (
	id INTEGER
		PRIMARY KEY
		GENERATED ALWAYS AS IDENTITY,
	name CITEXT
		UNIQUE
		NOT NULL,
	email CITEXT
		UNIQUE
		NOT NULL,
	passhash TEXT
		NOT NULL,
	bio TEXT
		NOT NULL
		DEFAULT '',
	CONSTRAINT user_name_proper_chars CHECK (name ~ '^\w+$'),
	CONSTRAINT user_name_min_length CHECK (char_length(name) >= 1),
	CONSTRAINT user_name_max_length CHECK (char_length(name) <= 24),
	CONSTRAINT email_proper_chars CHECK (email ~ '^.+@.+$'),
	CONSTRAINT email_min_length CHECK (char_length(email) >= 3),
	CONSTRAINT email_max_length CHECK (char_length(email) <= 256),
	CONSTRAINT passhash_proper_algorithm CHECK (passhash LIKE '$argon2id$%'),
	CONSTRAINT bio_proper_chars CHECK (
		bio ~ '^[a-zA-Z\d,;:''" \.\+\-\*\/\&%()?!]*$'
	),
	CONSTRAINT bio_max_length CHECK (char_length(bio) <= 64)
);

CREATE TABLE public.platforms (
	name TEXT
		PRIMARY KEY,
	CONSTRAINT platform_proper_chars CHECK (name ~ '^[a-zA-Z]+$')
);

CREATE TABLE public.identities (
	user_id INTEGER
		REFERENCES public.users (id)
		ON DELETE CASCADE,
	platform TEXT
		REFERENCES public.platforms (name)
		ON DELETE CASCADE,
	name IDENTITY_NAME_TEXT,
	description IDENTITY_DESCRIPTION_TEXT
		NOT NULL,
	status VERIFICATION_STATUS
		DEFAULT 'UNVERIFIED',
	requested_at TIMESTAMP,
	proof JSONB,
	PRIMARY KEY (user_id, platform, name)
);
