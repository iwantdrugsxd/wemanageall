-- ============================================
-- Supabase Calendar Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Create the function FIRST (before any triggers)
-- This function is used by triggers to auto-update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 2: Create the calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Core fields
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'event' CHECK (type IN ('event', 'task', 'note', 'reminder')),
    
    -- Time fields
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Styling
    color VARCHAR(7) DEFAULT '#3B6E5C', -- Hex color
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date_range ON calendar_events(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_all_day ON calendar_events(all_day);

-- Step 4: Create trigger (AFTER function exists)
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Add foreign key constraint
-- IMPORTANT: Choose the correct one based on your setup:
-- 
-- Option A: If using Supabase Auth (auth.users table)
-- ALTER TABLE calendar_events 
-- ADD CONSTRAINT calendar_events_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
--
-- Option B: If using your own users table in public schema
-- ALTER TABLE calendar_events 
-- ADD CONSTRAINT calendar_events_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Note: Since you're using Express sessions (not Supabase Auth),
-- you'll likely need Option B. Uncomment the line above if needed.
