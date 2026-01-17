# Fix Session Expiration Issues

## ❌ Current Problem

Sessions are expiring immediately, causing 401 Unauthorized errors and redirecting users to login.

## 🔍 Root Causes

1. **Session table might not exist** - The `connect-pg-simple` library should create it, but it might fail silently
2. **SESSION_SECRET not set** - Using default secret can cause issues in production
3. **Cookie settings** - Cookie configuration might not work correctly for HTTPS

## ✅ What I've Fixed

1. **Explicit session table creation** - Added code to ensure the session table exists before using it
2. **Better cookie configuration** - Set `sameSite: 'lax'` for same-domain requests
3. **Logging** - Added logs to help debug session issues

## 🎯 Additional Steps Needed

### Step 1: Verify SESSION_SECRET is Set

1. **Go to Render Dashboard**: https://dashboard.render.com/web/srv-d5lqo4vgi27c73943l8g/env
2. **Check if `SESSION_SECRET` exists**
3. **If not, add it**:
   - Key: `SESSION_SECRET`
   - Value: Generate a random string (you can use: `openssl rand -base64 32`)
   - Example: `d39eb3993ecd232a8d43c3460c400a2a1c3ade49750ba5f52bf046a61ae74234`

### Step 2: Verify Session Table Exists

After Render redeploys, check the logs for:
- `✅ Session table ready` - This means the table was created successfully

If you see warnings, you can manually create the table:

```sql
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire);
```

### Step 3: Check Browser Cookies

1. **Open DevTools** → **Application** tab → **Cookies**
2. **Look for `ofa.sid` cookie**
3. **Verify**:
   - Domain: `wemanageall.in`
   - Secure: ✅ (checked for HTTPS)
   - HttpOnly: ✅ (checked)
   - SameSite: `Lax`
   - Expires: Should be 7 days from now

### Step 4: Test Session Persistence

1. **Log in** to your app
2. **Check cookies** - `ofa.sid` should be present
3. **Make a request** (e.g., go to onboarding)
4. **Check server logs** - Should not see session errors
5. **Refresh page** - Should stay logged in

## 🐛 Troubleshooting

### If sessions still expire:

1. **Check Render logs** for session-related errors
2. **Verify DATABASE_URL** is correct and database is accessible
3. **Check if session table exists**:
   ```sql
   SELECT * FROM session LIMIT 1;
   ```
4. **Verify SESSION_SECRET** is set and not using default value
5. **Check cookie settings** in browser DevTools

### Common Issues:

- **"Session table doesn't exist"** → Run the SQL above to create it
- **"Invalid session secret"** → Set `SESSION_SECRET` in Render environment variables
- **"Cookie not being sent"** → Check `sameSite` and `secure` settings match your setup
- **"Session expires immediately"** → Check `maxAge` is set correctly (7 days = 604800000 ms)

## 📝 After Fix

Once sessions work correctly:
- ✅ Users stay logged in for 7 days
- ✅ No more 401 errors during onboarding
- ✅ Sessions persist across page refreshes
- ✅ No more redirect loops

