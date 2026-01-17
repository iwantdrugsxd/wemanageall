# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for OFA.

## Prerequisites

1. A Google Cloud Platform account
2. Access to your PostgreSQL database
3. Environment variables configured

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" user type
     - Fill in app name, user support email, developer contact
     - Add scopes: `email`, `profile`
     - Add test users (for development)
   - Application type: **Web application**
   - Name: "OFA Personal Life OS"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `http://localhost:3000` (development server)
     - Your production domain (e.g., `https://ofa.app`)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)

5. Copy your **Client ID** and **Client Secret**

## Step 2: Run Database Migration

Run the migration to add Google OAuth columns to your users table:

```bash
# Option 1: Using psql
psql -U your_username -d your_database -f server/db/migrate_google_oauth.sql

# Option 2: Using Supabase SQL Editor
# Copy and paste the contents of server/db/migrate_google_oauth.sql
```

Or manually run in your database:

```sql
-- Add google_id column
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Add photo column
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo TEXT;

-- Make password nullable (for Google OAuth users)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
```

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# Frontend URL (for redirects after OAuth)
FRONTEND_URL=http://localhost:5173
```

For production, update:
```env
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

## Step 4: Restart Your Server

After adding the environment variables, restart your server:

```bash
npm run dev
```

## Step 5: Test Google OAuth

1. Go to `/login` or `/signup`
2. Click "Continue with Google"
3. You should be redirected to Google's consent screen
4. After authorizing, you'll be redirected back to your app

## How It Works

1. **User clicks "Continue with Google"** → Redirects to `/api/auth/google`
2. **Passport initiates OAuth flow** → User is sent to Google
3. **User authorizes** → Google redirects to `/api/auth/google/callback`
4. **Server creates/updates user** → User is logged in via session
5. **User is redirected** → To dashboard or onboarding

## Troubleshooting

### Error: "Google OAuth credentials not found"
- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in your `.env`
- Restart your server after adding environment variables

### Error: "redirect_uri_mismatch"
- Check that your redirect URI in Google Console matches exactly:
  - Development: `http://localhost:3000/api/auth/google/callback`
  - Production: `https://yourdomain.com/api/auth/google/callback`
- Make sure there are no trailing slashes

### Error: "Database column doesn't exist"
- Run the migration script: `server/db/migrate_google_oauth.sql`
- Or manually add the columns as shown in Step 2

### User not being created
- Check server logs for errors
- Verify database connection
- Ensure `google_id` column allows NULL or has a unique constraint

## Security Notes

- Never commit your `.env` file with credentials
- Use different OAuth credentials for development and production
- Keep your Client Secret secure
- Regularly rotate your OAuth credentials

## Features

✅ **Automatic Account Creation**: New users are created automatically  
✅ **Account Linking**: Existing email accounts can be linked to Google  
✅ **Photo Support**: User profile photos from Google are saved  
✅ **Session Management**: Uses the same session system as email/password login  
✅ **Onboarding Flow**: Google users go through the same onboarding process




