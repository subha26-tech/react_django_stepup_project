-- Setup script for PostgreSQL
-- Run in psql or pgAdmin:
CREATE DATABASE stepup_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE stepup_db TO postgres;
