-- ============================================
-- Migration: Add workspace_code to organizations
-- Allows users to join workspaces using a share code
-- ============================================

-- Add workspace_code column
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS workspace_code VARCHAR(20) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_workspace_code ON organizations(workspace_code);

-- Generate codes for existing organizations
DO $$
DECLARE
    org_record RECORD;
    new_code VARCHAR(20);
    code_exists BOOLEAN;
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed confusing chars (0, O, I, 1)
    i INTEGER;
BEGIN
    FOR org_record IN SELECT id FROM organizations WHERE workspace_code IS NULL LOOP
        -- Generate unique 8-character code
        LOOP
            new_code := '';
            FOR i IN 1..8 LOOP
                new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
            END LOOP;
            
            -- Check if code already exists
            SELECT EXISTS(SELECT 1 FROM organizations WHERE workspace_code = new_code) INTO code_exists;
            
            EXIT WHEN NOT code_exists;
        END LOOP;
        
        -- Update organization with generated code
        UPDATE organizations 
        SET workspace_code = new_code 
        WHERE id = org_record.id;
    END LOOP;
END $$;






