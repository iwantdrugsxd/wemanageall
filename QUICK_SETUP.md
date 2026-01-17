# 🚀 Quick Setup Guide - Get Login/Signup/Google Auth Working

## ✅ What I've Fixed

1. **Auto-initialization**: Server now automatically creates the `users` table if it doesn't exist
2. **Complete schema**: Full database schema with all tables
3. **Improved initialization script**: Better error handling for database setup
4. **Google OAuth**: Fixed callback URL configuration

## 🎯 Two Ways to Fix the Database

### Option 1: Automatic (Easiest) ⭐

**The server will now auto-create the users table on startup!**

1. **Wait for Render to redeploy** (2-3 minutes after the latest push)
2. **Refresh your website**: https://wemanageall.in/signup
3. **Try signing up** - it should work automatically!

The server will create the essential tables (`users`, `user_values`, `user_roles`, `user_focus_areas`) automatically when it starts.

### Option 2: Manual (Complete Setup)

If you want all tables created at once:

1. **Go to Render Shell**: https://dashboard.render.com/web/srv-d5lqo4vgi27c73943l8g
2. **Click "Shell"** tab
3. **Run**:
   ```bash
   node server/db/init-render.js
   ```

This will create ALL tables (users, projects, tasks, organizations, etc.)

## 🔐 Google OAuth Setup

To enable Google sign-in:

1. **Update Google Cloud Console**:
   - Go to: https://console.cloud.google.com/
   - Your project → APIs & Services → Credentials
   - Click your OAuth 2.0 Client ID
   - Add to **Authorized redirect URIs**:
     ```
     https://wemanageall.in/api/auth/google/callback
     https://www.wemanageall.in/api/auth/google/callback
     ```
   - Add to **Authorized JavaScript origins**:
     ```
     https://wemanageall.in
     https://www.wemanageall.in
     ```

2. **Update Render Environment Variables**:
   - Go to: https://dashboard.render.com/web/srv-d5lqo4vgi27c73943l8g/env
   - Add/Update:
     - `GOOGLE_CALLBACK_URL` = `https://wemanageall.in/api/auth/google/callback`
     - `FRONTEND_URL` = `https://wemanageall.in`
     - `CORS_ORIGIN` = `https://wemanageall.in`

3. **Wait 5-10 minutes** for Google changes to propagate

## ✅ Verify Everything Works

1. **Email Signup**: https://wemanageall.in/signup
   - Fill in name, email, password
   - Click "Create account"
   - Should redirect to onboarding

2. **Email Login**: https://wemanageall.in/login
   - Enter email and password
   - Should log you in

3. **Google Sign-in**: https://wemanageall.in/signup or /login
   - Click "Continue with Google"
   - Should redirect to Google consent screen
   - After authorizing, should log you in

## 🐛 Troubleshooting

### "relation users does not exist"
- **Solution**: Wait for Render to redeploy, then refresh. The server will auto-create it.

### "Database connection failed"
- **Check**: `DATABASE_URL` is set in Render environment variables
- **Verify**: Your PostgreSQL database is running in Render

### Google OAuth "redirect_uri_mismatch"
- **Check**: Redirect URI in Google Console matches exactly: `https://wemanageall.in/api/auth/google/callback`
- **Wait**: 5-10 minutes after updating Google Console

### CORS errors
- **Check**: `CORS_ORIGIN` and `FRONTEND_URL` are set to `https://wemanageall.in` in Render

## 📝 What Happens Now

1. **Server starts** → Checks if `users` table exists
2. **If missing** → Automatically creates `users`, `user_values`, `user_roles`, `user_focus_areas`
3. **Server ready** → You can sign up, log in, or use Google auth!

## 🎉 You're All Set!

After Render redeploys (2-3 minutes), your authentication should work:
- ✅ Email signup
- ✅ Email login  
- ✅ Google OAuth (after Google Console setup)

