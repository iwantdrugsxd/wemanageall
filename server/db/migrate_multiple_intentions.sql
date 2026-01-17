-- ============================================
-- Migration: Allow Multiple Intentions Per Day
-- Run this to remove the unique constraint on daily_intentions
-- ============================================

-- Remove the unique constraint if it exists
DO $$ 
BEGIN
    -- Check if the constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'daily_intentions_user_id_entry_date_key'
    ) THEN
        ALTER TABLE daily_intentions 
        DROP CONSTRAINT daily_intentions_user_id_entry_date_key;
    END IF;
END $$;

-- Verify the constraint is removed
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'daily_intentions_user_id_entry_date_key'
        ) 
        THEN 'Constraint still exists - migration may have failed'
        ELSE 'Constraint removed successfully'
    END as migration_status;








