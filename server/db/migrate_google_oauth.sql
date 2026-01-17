-- ============================================
-- Migration: Add Google OAuth Support
-- Run this in your PostgreSQL database
-- ============================================

-- Add google_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'google_id'
  ) THEN
    ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
  END IF;
END $$;

-- Add photo column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'photo'
  ) THEN
    ALTER TABLE users ADD COLUMN photo TEXT;
  END IF;
END $$;

-- Make password nullable for Google OAuth users
DO $$ 
BEGIN
  ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
EXCEPTION
  WHEN others THEN
    -- Column might already be nullable, ignore error
    NULL;
END $$;




