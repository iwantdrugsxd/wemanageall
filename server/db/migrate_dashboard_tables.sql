-- ============================================
-- Migration: Add Dashboard Tables
-- Run this to add the new tables for dashboard entries
-- ============================================

-- ============================================
-- Daily Intentions Table (Today's Intention)
-- Multiple intentions per day allowed
-- ============================================
CREATE TABLE IF NOT EXISTS daily_intentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    intention TEXT NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Remove unique constraint if it exists (allows multiple intentions per day)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'daily_intentions_user_id_entry_date_key'
    ) THEN
        ALTER TABLE daily_intentions 
        DROP CONSTRAINT daily_intentions_user_id_entry_date_key;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_daily_intentions_user_id ON daily_intentions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_intentions_entry_date ON daily_intentions(entry_date);

-- ============================================
-- Thinking Space Entries Table
-- ============================================
CREATE TABLE IF NOT EXISTS thinking_space_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'freewrite' CHECK (mode IN ('freewrite', 'stuck', 'decision')),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_thinking_space_user_id ON thinking_space_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_thinking_space_entry_date ON thinking_space_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_thinking_space_created_at ON thinking_space_entries(created_at DESC);

-- ============================================
-- Update Journal Entries Table
-- Add unique constraint for user_id and entry_date
-- ============================================
-- First, remove any duplicate entries (keep the most recent one)
DELETE FROM journal_entries a
USING journal_entries b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.entry_date = b.entry_date;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'journal_entries_user_id_entry_date_key'
    ) THEN
        ALTER TABLE journal_entries 
        ADD CONSTRAINT journal_entries_user_id_entry_date_key 
        UNIQUE (user_id, entry_date);
    END IF;
END $$;

-- ============================================
-- Add Triggers for Updated At
-- ============================================

-- Ensure the update function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to daily_intentions table
DROP TRIGGER IF EXISTS update_daily_intentions_updated_at ON daily_intentions;
CREATE TRIGGER update_daily_intentions_updated_at
    BEFORE UPDATE ON daily_intentions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to thinking_space_entries table
DROP TRIGGER IF EXISTS update_thinking_space_updated_at ON thinking_space_entries;
CREATE TRIGGER update_thinking_space_updated_at
    BEFORE UPDATE ON thinking_space_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Migration Complete
-- ============================================

