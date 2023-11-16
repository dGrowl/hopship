INSERT INTO public.platforms (name)
VALUES
	('Bluesky'),
	('Mastodon'),
	('Threads'),
	('Twitch'),
	('Twitter'),
	('YouTube');

INSERT INTO public.networks (name, platform)
VALUES
	('bsky.social', 'Bluesky'),
	('mastodon.social', 'Mastodon'),
	('mstdn.social', 'Mastodon'),
	('threads.net', 'Threads'),
	('twitch.tv', 'Twitch'),
	('twitter.com', 'Twitter'),
	('youtube.com', 'YouTube');
