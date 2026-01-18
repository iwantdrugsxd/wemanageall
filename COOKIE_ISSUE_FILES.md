# 🍪 Cookie Issue - All Responsible Files

## 📋 Files That Control Cookie/Session Behavior

### 🔴 **CRITICAL FILES** (Must Check These First)

#### 1. **`server/index.js`** ⚠️ PRIMARY FILE
**Location:** `/Users/vishnu/One-for-all/server/index.js`

**What it controls:**
- Session configuration (cookie settings)
- CORS configuration (credentials)
- Passport initialization order
- Cookie path, domain, secure, sameSite settings

**Key sections:**
- Lines 45-67: CORS configuration (`credentials: true`)
- Lines 121-140: Session cookie configuration
- Lines 147-151: Passport initialization (MUST be after session)
- Lines 158-175: Cookie debugging middleware

**Critical settings:**
```javascript
cookie: {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: 'lax',
  path: '/',
}
```

#### 2. **`server/config/passport.js`** ⚠️ CRITICAL
**Location:** `/Users/vishnu/One-for-all/server/config/passport.js`

**What it controls:**
- How user ID is stored in session (`serializeUser`)
- How user is retrieved from session (`deserializeUser`)
- If these fail, passport data won't be in session

**Key sections:**
- Lines 102-109: `serializeUser` - Stores user ID in `req.session.passport.user`
- Lines 112-130: `deserializeUser` - Retrieves user from database using stored ID

**If broken:**
- `serializeUser` not called → No passport data in session
- `deserializeUser` fails → User not authenticated even if passport data exists

#### 3. **`server/routes/auth.js`** ⚠️ CRITICAL
**Location:** `/Users/vishnu/One-for-all/server/routes/auth.js`

**What it controls:**
- Login flow (`req.login()`)
- Session saving after login
- Cookie setting in response

**Key sections:**
- Lines 92-134: Login route - calls `req.login()` and saves session
- Lines 38-78: Signup route - also calls `req.login()`

**If broken:**
- `req.login()` not called → No passport data
- Session not saved → Cookie not set
- Response sent before session save → Cookie lost

---

### 🟡 **IMPORTANT FILES** (Secondary but Important)

#### 4. **`server/routes/profile.js`**
**Location:** `/Users/vishnu/One-for-all/server/routes/profile.js`

**What it controls:**
- Authentication middleware (`requireAuth`)
- Cookie detection and logging
- Onboarding endpoint (where errors occur)

**Key sections:**
- Lines 16-42: `requireAuth` middleware - checks `req.isAuthenticated()`
- Lines 80-110: Onboarding endpoint - where 401 errors happen

#### 5. **`src/context/AuthContext.jsx`**
**Location:** `/Users/vishnu/One-for-all/src/context/AuthContext.jsx`

**What it controls:**
- Frontend cookie sending (`credentials: 'include'`)
- Login/signup API calls
- Session state management

**Key sections:**
- Lines 16-17: `checkAuth()` - sends cookies with `credentials: 'include'`
- Lines 62-66: `login()` - sends cookies with `credentials: 'include'`
- Lines 198-213: `updateOnboarding()` - sends cookies with `credentials: 'include'`

**If broken:**
- Missing `credentials: 'include'` → Cookies not sent
- Wrong fetch URL → Cookies sent to wrong domain

#### 6. **`src/pages/Onboarding.jsx`**
**Location:** `/Users/vishnu/One-for-all/src/pages/Onboarding.jsx`

**What it controls:**
- Onboarding form submission
- Error handling for 401 errors
- Redirect logic

**Key sections:**
- Lines 66-137: `handleNext()` - saves onboarding data
- Lines 89-96: Error handling for unauthorized requests

---

### 🟢 **SUPPORTING FILES** (Less Critical but Related)

#### 7. **`server/db/config.js`**
**Location:** `/Users/vishnu/One-for-all/server/db/config.js`

**What it controls:**
- Database connection pool (used by session store)
- If database connection fails, sessions can't be saved/retrieved

#### 8. **`server/db/ensure-users-table.js`**
**Location:** `/Users/vishnu/One-for-all/server/db/ensure-users-table.js`

**What it controls:**
- Creates users table (needed for authentication)
- Not directly related to cookies, but needed for login to work

#### 9. **`server/models/user.js`**
**Location:** `/Users/vishnu/One-for-all/server/models/user.js`

**What it controls:**
- User creation and retrieval
- Used by Passport for authentication
- If `getUserProfile()` fails, deserialization fails

---

## 🔍 **How to Debug the Cookie Issue**

### Step 1: Check if Cookie is Being Set
**File:** `server/routes/auth.js` (line ~141)

After login, logs should show:
```
🍪 Set-Cookie header: present [cookie value]
```

**If "missing":**
- Cookie isn't being set by server
- Check `server/index.js` session config
- Check if `req.session.save()` is being called

### Step 2: Check if Cookie is Being Sent
**File:** `server/routes/profile.js` (line ~22-33)

On next request, logs should show:
```
⚠️  Unauthenticated request: {
  cookies: 'present' or 'missing',
  hasOfaSidCookie: true/false
}
```

**If "missing" or `hasOfaSidCookie: false`:**
- Browser isn't sending the cookie
- Check browser DevTools → Application → Cookies
- Check CORS configuration in `server/index.js`

### Step 3: Check if Passport Data is in Session
**File:** `server/routes/auth.js` (line ~112-126)

After login, logs should show:
```
🔍 Immediately after req.login: {
  hasPassport: true,
  passportUser: '[user-id]'
}
```

**If `hasPassport: false`:**
- `serializeUser` isn't working
- Check `server/config/passport.js` line 102-109

### Step 4: Check Session Store
**File:** `server/index.js` (line ~122-127)

Session store configuration:
```javascript
store: new PgSession({
  pool: pool,
  tableName: 'session',
  createTableIfMissing: true,
})
```

**If sessions aren't persisting:**
- Check database connection
- Check if session table exists
- Run `node server/db/fix-session-table.js`

---

## 🎯 **Quick Fix Checklist**

Go through each file and verify:

### ✅ `server/index.js`
- [ ] CORS has `credentials: true` (line 66)
- [ ] Session cookie has `path: '/'` (line 137)
- [ ] Session cookie has `sameSite: 'lax'` (line 136)
- [ ] Session cookie has `secure: true` in production (line 133)
- [ ] Passport initialized AFTER session (line 150-151)

### ✅ `server/config/passport.js`
- [ ] `serializeUser` is defined (line 102)
- [ ] `deserializeUser` is defined (line 112)
- [ ] Both functions are logging correctly

### ✅ `server/routes/auth.js`
- [ ] `req.login()` is called (line 105)
- [ ] `req.session.save()` is called (line 129)
- [ ] Logging shows passport data after login

### ✅ `src/context/AuthContext.jsx`
- [ ] All fetch calls have `credentials: 'include'`
- [ ] URLs are correct (not hardcoded localhost)

### ✅ Browser
- [ ] DevTools → Application → Cookies → `ofa.sid` exists
- [ ] Cookie has correct domain: `wemanageall.in`
- [ ] Cookie has `Secure: true`
- [ ] Cookie has `SameSite: Lax`

---

## 🚨 **Most Common Issues**

1. **Cookie not set** → Check `server/routes/auth.js` - session.save()
2. **Cookie not sent** → Check `src/context/AuthContext.jsx` - credentials: 'include'
3. **Passport data missing** → Check `server/config/passport.js` - serializeUser
4. **CORS blocking** → Check `server/index.js` - CORS config
5. **Session table broken** → Run `node server/db/fix-session-table.js`

---

## 📝 **Files Summary**

| File | Purpose | Critical? |
|------|---------|-----------|
| `server/index.js` | Session & CORS config | 🔴 YES |
| `server/config/passport.js` | Passport serialization | 🔴 YES |
| `server/routes/auth.js` | Login/signup flow | 🔴 YES |
| `server/routes/profile.js` | Auth middleware | 🟡 Important |
| `src/context/AuthContext.jsx` | Frontend cookie sending | 🟡 Important |
| `src/pages/Onboarding.jsx` | Error handling | 🟢 Supporting |
| `server/db/config.js` | Database connection | 🟢 Supporting |

---

## 🔧 **Next Steps**

1. **Check logs** after redeploy for cookie-related messages
2. **Verify** each file's critical settings match this guide
3. **Test** in browser DevTools to see actual cookie behavior
4. **Compare** session IDs between login and next request (should match!)

