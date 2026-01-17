# Supabase Quick Start Guide

## ✅ Environment Variables Added

Your `.env` file now includes:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anon key (for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for server-side operations)

## 🚀 Next Steps

### 1. Run Supabase Setup SQL

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `nogqzpfnttilcamfpmps`
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `supabase-setup.sql`
5. Click **Run**

This will:
- Create the `unload_entries` table
- Create the `unload-recordings` storage bucket
- Set up storage policies

### 2. Initialize Database Table

Run this to create the table in your local PostgreSQL:

```bash
npm run db:init
```

### 3. Start the Application

```bash
npm run dev
```

## 📝 How It Works

- **Text entries**: Stored directly in PostgreSQL `unload_entries` table
- **Voice recordings**: 
  - Uploaded to Supabase Storage bucket `unload-recordings`
  - URL stored in PostgreSQL `unload_entries` table
  - Audio files organized by user ID: `{user_id}/{timestamp}.webm`

## 🔒 Security Notes

- Storage bucket is set to **private** (not public)
- Storage policies allow uploads/reads/deletes (adjust in production)
- Database uses Express session-based auth (not Supabase Auth)
- RLS is disabled on `unload_entries` table (auth handled server-side)

## 🧪 Testing

1. Navigate to `/emotions` (Unload page)
2. Try writing a text entry
3. Try recording a voice entry
4. Check history view
5. Test lock/unlock functionality









