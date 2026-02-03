-- ============================================
-- Migration: Install and Enable pgvector Extension
-- ============================================
-- This migration installs the pgvector extension for semantic search
-- 
-- Prerequisites:
-- 1. PostgreSQL 11+ 
-- 2. pgvector extension installed on the server
--    - Ubuntu/Debian: sudo apt-get install postgresql-14-pgvector (adjust version)
--    - macOS: brew install pgvector
--    - Or compile from source: https://github.com/pgvector/pgvector
--
-- If pgvector is not installed on the server, this will fail gracefully
-- and you'll need to install it first.

-- Check if pgvector extension is available
DO $$
BEGIN
    -- Try to create the extension
    CREATE EXTENSION IF NOT EXISTS vector;
    
    RAISE NOTICE '✅ pgvector extension enabled successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '⚠️  pgvector extension not available. Error: %', SQLERRM;
        RAISE WARNING '   Please install pgvector on your PostgreSQL server first.';
        RAISE WARNING '   See: https://github.com/pgvector/pgvector#installation';
END $$;

-- Verify the extension is installed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
    ) THEN
        RAISE NOTICE '✅ pgvector extension verified';
    ELSE
        RAISE WARNING '⚠️  pgvector extension not found. Semantic search features will not work.';
    END IF;
END $$;










