# Google OAuth Quick Start Guide

## ✅ What's Already Implemented

The "Continue with Google" functionality is **already built** into your application:
- ✅ Frontend buttons on Login and Signup pages
- ✅ Backend routes (`/api/auth/google` and `/api/auth/google/callback`)
- ✅ Passport.js Google Strategy configured
- ✅ Database migration script ready

## 🔧 What You Need to Do

### Step 1: Set Up Google Cloud Console

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
   - Sign in with your Google account
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Navigate to: **APIs & Services** > **Library**
   - Search for "Google+ API" or "People API"
   - Click **Enable**

3. **Configure OAuth Consent Screen**
   - Go to: **APIs & Services** > **OAuth consent screen**
   - Choose **External** (for testing) or **Internal** (for Google Workspace)
   - Fill in:
     - App name: `OFA Personal Life OS`
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (your email) if using External
   - Click **Save and Continue** through the rest

4. **Create OAuth 2.0 Credentials**
   - Go to: **APIs & Services** > **Credentials**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - Application type: **Web application**
   - Name: `OFA Web Client`
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     http://localhost:3000
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - Click **Create**
   - **Copy your Client ID and Client Secret** (you'll need these next)

### Step 2: Add Environment Variables

Create or update your `.env` file in the project root:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# Frontend URL (for redirects after OAuth)
FRONTEND_URL=http://localhost:5173
```

**Important:** Replace `your_client_id_here` and `your_client_secret_here` with the actual values from Google Cloud Console.

### Step 3: Run Database Migration

Run the migration to add Google OAuth support to your database:

```bash
# Option 1: Using psql (if you have direct database access)
psql -U your_username -d your_database -f server/db/migrate_google_oauth.sql

# Option 2: Using Supabase SQL Editor
# 1. Go to your Supabase project
# 2. Navigate to SQL Editor
# 3. Copy and paste the contents of server/db/migrate_google_oauth.sql
# 4. Run the query
```

Or manually run this SQL:

```sql
-- Add google_id column
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Add photo column
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo TEXT;

-- Make password nullable (for Google OAuth users)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
```

### Step 4: Restart Your Server

After adding environment variables, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test It!

1. Go to `http://localhost:5173/login` or `http://localhost:5173/signup`
2. Click the **"Continue with Google"** button
3. You should be redirected to Google's consent screen
4. After authorizing, you'll be redirected back and logged in!

## 🚨 Troubleshooting

### "Google OAuth credentials not found" warning
- ✅ Make sure `.env` file exists in project root
- ✅ Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- ✅ Restart server after adding environment variables
- ✅ No quotes needed around values in `.env`

### "redirect_uri_mismatch" error
- ✅ Check that redirect URI in Google Console **exactly** matches:
  - `http://localhost:3000/api/auth/google/callback`
- ✅ No trailing slashes
- ✅ Make sure you're using `http://` not `https://` for localhost
- ✅ If your server runs on a different port, update both:
  - Google Console redirect URI
  - `GOOGLE_CALLBACK_URL` in `.env`

### Database errors
- ✅ Run the migration script: `server/db/migrate_google_oauth.sql`
- ✅ Check that `users` table exists
- ✅ Verify database connection

### User not being created
- ✅ Check server console for errors
- ✅ Verify Google credentials are correct
- ✅ Check that email is provided in Google profile
- ✅ Look for errors in browser console (F12)

## 📝 For Production

When deploying to production, update:

1. **Google Cloud Console:**
   - Add production domain to Authorized JavaScript origins:
     ```
     https://yourdomain.com
     ```
   - Add production redirect URI:
     ```
     https://yourdomain.com/api/auth/google/callback
     ```

2. **Environment Variables:**
   ```env
   GOOGLE_CALLBACK_URL=/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Consider creating separate OAuth credentials** for production (best practice)

## ✨ Features

Once set up, you'll have:
- ✅ One-click Google sign-in
- ✅ Automatic account creation for new users
- ✅ Account linking (if email matches existing account)
- ✅ Profile photo from Google
- ✅ Same session system as email/password login
- ✅ Onboarding flow for new Google users

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)




