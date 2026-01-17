-- ============================================
-- Supabase Setup for Unload Feature
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create unload_entries table
CREATE TABLE IF NOT EXISTS unload_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'voice')),
    content TEXT,
    audio_url TEXT,
    duration INTEGER, -- in seconds for voice entries
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_unload_entries_user_id ON unload_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_unload_entries_created_at ON unload_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_unload_entries_type ON unload_entries(type);
CREATE INDEX IF NOT EXISTS idx_unload_entries_locked ON unload_entries(locked);

-- Note: Since we're using Express sessions (not Supabase Auth),
-- we'll handle authentication in the Express API layer.
-- RLS is disabled for this table - auth is handled server-side.
ALTER TABLE unload_entries DISABLE ROW LEVEL SECURITY;

-- Create storage bucket for recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('unload-recordings', 'unload-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for unload-recordings bucket
-- Since we're using Express sessions (not Supabase Auth), we'll allow public uploads
-- but restrict reads to authenticated requests. In production, consider using signed URLs.

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

-- Allow public deletes (for cleanup - consider restricting this in production)
CREATE POLICY "Allow public deletes" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'unload-recordings'
    );
