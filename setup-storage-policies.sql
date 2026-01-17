-- ============================================
-- Supabase Storage Policies for Unload Recordings
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Allow public uploads (client-side with anon key)
CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'unload-recordings'
    );

-- Allow public reads (for playback)
CREATE POLICY "Allow public reads" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'unload-recordings'
    );

-- Allow public deletes (for cleanup)
CREATE POLICY "Allow public deletes" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'unload-recordings'
    );









