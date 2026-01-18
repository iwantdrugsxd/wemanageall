-- ============================================
-- Add Time Tracking to Tasks Table
-- ============================================
DO $$ 
BEGIN
    -- Add time_estimate (in minutes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_estimate') THEN
        ALTER TABLE tasks ADD COLUMN time_estimate INTEGER;
    END IF;
    
    -- Add time_spent (in minutes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_spent') THEN
        ALTER TABLE tasks ADD COLUMN time_spent INTEGER DEFAULT 0;
    END IF;
END $$;



-- Add Time Tracking to Tasks Table
-- ============================================
DO $$ 
BEGIN
    -- Add time_estimate (in minutes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_estimate') THEN
        ALTER TABLE tasks ADD COLUMN time_estimate INTEGER;
    END IF;
    
    -- Add time_spent (in minutes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_spent') THEN
        ALTER TABLE tasks ADD COLUMN time_spent INTEGER DEFAULT 0;
    END IF;
END $$;



-- Add Time Tracking to Tasks Table
-- ============================================
DO $$ 
BEGIN
    -- Add time_estimate (in minutes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_estimate') THEN
        ALTER TABLE tasks ADD COLUMN time_estimate INTEGER;
    END IF;
    
    -- Add time_spent (in minutes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_spent') THEN
        ALTER TABLE tasks ADD COLUMN time_spent INTEGER DEFAULT 0;
    END IF;
END $$;



