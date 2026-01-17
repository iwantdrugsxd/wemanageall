# Fix Google OAuth Redirect URI Mismatch Error

## ❌ Current Error

**Error 400: redirect_uri_mismatch**

This means the redirect URI in Google Cloud Console doesn't match what your app is using.

## 🎯 Solution: Update Google Cloud Console

### Step 1: Go to Google Cloud Console

1. **Navigate to**: https://console.cloud.google.com/
2. **Select your project** (the one with your OAuth credentials)
3. **Go to**: **APIs & Services** > **Credentials**
4. **Click on your OAuth 2.0 Client ID** (the one you're using)

### Step 2: Add Authorized Redirect URIs

In the **Authorized redirect URIs** section, add these URIs:

```
https://wemanageall.in/api/auth/google/callback
https://www.wemanageall.in/api/auth/google/callback
```

**Important**: 
- Use `https://` (not `http://`)
- Include both `wemanageall.in` and `www.wemanageall.in`
- No trailing slashes
- Must match exactly

### Step 3: Add Authorized JavaScript Origins

In the **Authorized JavaScript origins** section, add:

```
https://wemanageall.in
https://www.wemanageall.in
```

### Step 4: Save Changes

Click **Save** at the bottom of the page.

### Step 5: Update Render Environment Variables

1. **Go to**: https://dashboard.render.com/web/srv-d5lqo4vgi27c73943l8g/env

2. **Add/Update these variables**:
   - `GOOGLE_CALLBACK_URL` = `https://wemanageall.in/api/auth/google/callback`
   - `FRONTEND_URL` = `https://wemanageall.in`
   - `CORS_ORIGIN` = `https://wemanageall.in`

3. **Wait for auto-redeploy** (2-5 minutes)

## ✅ After Fix

Google OAuth will work:
- Users can sign in with Google
- Redirect will work correctly
- No more `redirect_uri_mismatch` errors

## 📝 Code Update

I've updated the code to automatically construct the callback URL from `FRONTEND_URL` if `GOOGLE_CALLBACK_URL` is not set. This ensures it works in both development and production.

## 🔍 Verify It Works

1. Go to: https://wemanageall.in/login
2. Click "Continue with Google"
3. You should be redirected to Google's consent screen
4. After authorizing, you'll be redirected back and logged in

## ⚠️ Important Notes

- **Wait 5-10 minutes** after updating Google Cloud Console (changes can take time to propagate)
- Make sure **both** `wemanageall.in` and `www.wemanageall.in` are added (if you use both)
- The redirect URI must be **exactly** `https://wemanageall.in/api/auth/google/callback` (no trailing slash)


