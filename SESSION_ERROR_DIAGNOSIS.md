# Session Expiration Error - Diagnosis & Fix

## 🔍 Possible Causes

Based on the 401 errors and session expiration, here are the most likely causes:

### 1. **Session Table is Corrupted** ⚠️ MOST LIKELY
The "multiple primary keys" error we saw earlier suggests the session table might be in a corrupted state. This would prevent sessions from being saved or retrieved.

**Symptoms:**
- Sessions expire immediately after login
- 401 errors on every request
- "multiple primary keys" error in logs

**Fix:**
```sql
-- Drop and recreate the session table
DROP TABLE IF EXISTS session CASCADE;

-- Restart the service - connect-pg-simple will recreate it automatically
```

### 2. **SESSION_SECRET Not Set** ⚠️ VERY LIKELY
If `SESSION_SECRET` is not set in Render, the app uses a default secret. This can cause:
- Sessions to be invalidated on server restart
- Sessions to be invalidated if multiple instances are running
- Security issues

**Check:**
1. Go to: https://dashboard.render.com/web/srv-d5lqo4vgi27c73943l8g/env
2. Look for `SESSION_SECRET`
3. If missing, add it with a random 32+ character string

**Generate Secret:**
```bash
openssl rand -base64 32
```

### 3. **Session Store Connection Failing**
If the PostgreSQL connection for sessions is failing, sessions won't be saved.

**Check Render Logs For:**
- Database connection errors
- Session store errors
- "Session table creation" warnings

### 4. **Cookie Not Being Sent**
If cookies aren't being sent with requests, the session won't be found.

**Check in Browser DevTools:**
1. Open DevTools → Network tab
2. Make a request (e.g., save onboarding)
3. Click on the request → Headers tab
4. Check "Request Headers" → Look for `Cookie: ofa.sid=...`
5. If missing, cookies aren't being sent

**Also Check:**
- Application tab → Cookies → `wemanageall.in`
- Look for `ofa.sid` cookie
- Verify it has:
  - Domain: `wemanageall.in`
  - Secure: ✅ (for HTTPS)
  - HttpOnly: ✅
  - SameSite: `Lax`

### 5. **Session Not Being Saved After Login**
Even though we added `req.session.save()`, if there's an error, it might not be saved.

**Check Render Logs For:**
- `✅ Session saved for user:` - Confirms session was saved
- `Session save error:` - Indicates save failed

## 🎯 Quick Fix Steps

### Step 1: Fix Session Table (Most Important)

1. **Go to Render Shell**: https://dashboard.render.com/web/srv-d5lqo4vgi27c73943l8g/shell
2. **Run**:
```bash
# Connect to database
psql $DATABASE_URL

# Then run:
DROP TABLE IF EXISTS session CASCADE;
\q
```

3. **Restart the service** - The session table will be recreated automatically

### Step 2: Verify SESSION_SECRET

1. **Go to**: https://dashboard.render.com/web/srv-d5lqo4vgi27c73943l8g/env
2. **Check if `SESSION_SECRET` exists**
3. **If not, add it**:
   - Key: `SESSION_SECRET`
   - Value: `openssl rand -base64 32` (run locally to generate)

### Step 3: Check Browser Cookies

1. **Open DevTools** → **Application** → **Cookies** → `wemanageall.in`
2. **Look for `ofa.sid`**
3. **If missing**:
   - Clear cookies for `wemanageall.in`
   - Log in again
   - Check if cookie appears

### Step 4: Check Render Logs

After redeploy, look for:
- ✅ `Session table exists and is properly configured`
- ✅ `Session saved for user: [email]`
- ❌ Any session-related errors

## 🔧 Manual Session Table Creation

If automatic creation fails, create it manually:

```sql
CREATE TABLE session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
)
WITH (OIDS=FALSE);

CREATE INDEX IDX_session_expire ON session(expire);
```

## 📊 Debugging Checklist

- [ ] Session table exists and is not corrupted
- [ ] SESSION_SECRET is set in Render environment variables
- [ ] Cookie `ofa.sid` is present in browser
- [ ] Cookie is being sent with requests (check Network tab)
- [ ] No session-related errors in Render logs
- [ ] Database connection is working
- [ ] CORS is configured correctly (`credentials: true`)

## 🚨 Most Common Issue

**The session table is corrupted from the "multiple primary keys" error.**

**Solution:** Drop and recreate the session table (Step 1 above).

