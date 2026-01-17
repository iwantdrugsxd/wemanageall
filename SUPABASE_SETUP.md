# Supabase Setup for Unload Feature

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

## 2. Configure Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run SQL Setup

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase-setup.sql`

This will:
- Create the `unload_entries` table
- Set up Row Level Security policies
- Create the storage bucket for recordings
- Set up storage policies

## 4. Storage Bucket Setup

The SQL will create a bucket called `unload-recordings`. Make sure:
- It's set to **private** (not public)
- File size limit is appropriate (default is fine)
- Allowed MIME types include `audio/webm`

## 5. Authentication Setup

Since we're using session-based auth with Express, you'll need to either:
- Use Supabase Auth and sync user IDs, OR
- Modify the RLS policies to work with your current auth system

For now, the code assumes `user.id` from your Express session matches Supabase user IDs. You may need to adjust the RLS policies based on your auth setup.









