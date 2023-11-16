-- Run script with `psql "API_PASSWORD='password'"`
CREATE USER api
WITH PASSWORD :API_PASSWORD;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO api;
