-- ============================================
-- Migration: Add transcript field to unload_entries
-- Run this in your Supabase SQL Editor AND local PostgreSQL
-- ============================================

-- Add transcript column if it doesn't exist
ALTER TABLE unload_entries 
ADD COLUMN IF NOT EXISTS transcript TEXT;

-- Add index for transcript searches (optional, but useful)
CREATE INDEX IF NOT EXISTS idx_unload_entries_transcript 
ON unload_entries USING gin(to_tsvector('english', transcript))
WHERE transcript IS NOT NULL;







