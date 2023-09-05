DROP TABLE IF EXISTS public.admin_messages;
DROP TABLE IF EXISTS public.verifications;
DROP TABLE IF EXISTS public.identities;
DROP TABLE IF EXISTS public.networks;
DROP TABLE IF EXISTS public.platforms;
DROP TABLE IF EXISTS public.users;

DROP TYPE IF EXISTS VERIFICATION_STATUS;

DROP EXTENSION IF EXISTS citext;

CREATE EXTENSION citext;

CREATE TYPE VERIFICATION_STATUS AS ENUM ('UNVERIFIED', 'PENDING', 'REJECTED', 'VERIFIED');

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
		bio ~ '^(?!\s)(?!.*\s{2})[\u0020-\u007E]*(?<!\s)$'
	),
	CONSTRAINT bio_max_length CHECK (char_length(bio) <= 64)
);

CREATE TABLE public.platforms (
	name TEXT
		PRIMARY KEY
);

CREATE TABLE public.networks (
	name TEXT
		PRIMARY KEY,
	platform TEXT
		REFERENCES public.platforms (name)
		ON DELETE CASCADE
);

CREATE TABLE public.identities (
	user_id INTEGER
		REFERENCES public.users (id)
		ON DELETE CASCADE,
	platform TEXT
		REFERENCES public.platforms (name)
		ON DELETE CASCADE,
	network TEXT
		REFERENCES public.networks (name)
		ON DELETE CASCADE,
	name CITEXT,
	description TEXT
		NOT NULL,
	status VERIFICATION_STATUS
		DEFAULT 'UNVERIFIED',
	PRIMARY KEY (user_id, network, name),
	CONSTRAINT network_name_proper_chars CHECK (name ~ '^\w+$'),
	CONSTRAINT network_name_min_length CHECK (char_length(name) >= 1),
	CONSTRAINT network_name_max_length CHECK (char_length(name) <= 64),
	CONSTRAINT description_proper_chars CHECK (
		description ~ '^(?!\s)(?!.*\s{2})[\u0020-\u007E]*(?<!\s)$'
	),
	CONSTRAINT description_max_length CHECK (char_length(description) <= 48)
);

CREATE TABLE public.verifications (
	user_id INTEGER,
	network TEXT,
	name CITEXT,
	requested_at TIMESTAMP,
	proof JSONB
		DEFAULT NULL,
	approved BOOLEAN
		DEFAULT NULL,
	response TEXT
		DEFAULT NULL,
	PRIMARY KEY (user_id, network, name, requested_at),
	FOREIGN KEY (user_id, network, name)
		REFERENCES public.identities (user_id, network, name)
		ON DELETE CASCADE
);

CREATE TABLE public.admin_messages (
	id INTEGER
		PRIMARY KEY
		GENERATED ALWAYS AS IDENTITY,
	email TEXT,
	message TEXT
		NOT NULL,
	timestamp TIMESTAMP
		NOT NULL
		DEFAULT current_timestamp,
	read BOOLEAN
		DEFAULT false,
	CONSTRAINT email_proper_chars CHECK (email ~ '^.+@.+$'),
	CONSTRAINT message_min_length CHECK (char_length(message) >= 2),
	CONSTRAINT message_max_length CHECK (char_length(message) <= 2048)
)
