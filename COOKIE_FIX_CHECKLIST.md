# 🍪 Cookie Issue - Quick Fix Checklist

## 🔴 **CRITICAL FILES TO CHECK** (In Order of Importance)

### 1. **`server/index.js`** - Session & CORS Configuration
**Lines to check:**
- **Line 45-67**: CORS config - Must have `credentials: true`
- **Line 121-140**: Session cookie config - Check `secure`, `sameSite`, `path`
- **Line 147-151**: Passport initialization - MUST be after session middleware

**What to verify:**
```javascript
// Line 66: CORS must allow credentials
credentials: true

// Line 132-137: Cookie settings
cookie: {
  secure: process.env.NODE_ENV === 'production',  // true for HTTPS
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: 'lax',  // Must be 'lax' for same-domain
  path: '/',  // Must be '/' for all paths
}

// Line 150-151: Order matters!
app.use(passport.initialize());
app.use(passport.session());
```

---

### 2. **`server/config/passport.js`** - Passport Serialization
**Lines to check:**
- **Line 102-109**: `serializeUser` - Stores user ID in session
- **Line 112-130**: `deserializeUser` - Retrieves user from session

**What to verify:**
```javascript
// Line 102-109: Must store user.id
passport.serializeUser((user, done) => {
  done(null, user.id);  // This creates req.session.passport.user
});

// Line 112-130: Must retrieve user by ID
passport.deserializeUser(async (id, done) => {
  const user = await getUserProfile(id);
  done(null, user);
});
```

**If broken:**
- No `req.session.passport.user` → `isAuthenticated()` returns false

---

### 3. **`server/routes/auth.js`** - Login Flow
**Lines to check:**
- **Line 105**: `req.login(user, ...)` - Must be called
- **Line 129**: `req.session.save(...)` - Must be called after login
- **Line 141**: Cookie logging - Check if Set-Cookie header is sent

**What to verify:**
```javascript
// Line 105: Must call req.login
req.login(user, (err) => {
  // Line 129: Must save session
  req.session.save((saveErr) => {
    // Response sent here
  });
});
```

**If broken:**
- `req.login()` not called → No passport data
- Session not saved → Cookie not set

---

### 4. **`src/context/AuthContext.jsx`** - Frontend Cookie Sending
**Lines to check:**
- **Line 16-17**: `checkAuth()` - Must have `credentials: 'include'`
- **Line 62-66**: `login()` - Must have `credentials: 'include'`
- **Line 198-203**: `updateOnboarding()` - Must have `credentials: 'include'`

**What to verify:**
```javascript
// All fetch calls must have:
fetch('/api/...', {
  credentials: 'include',  // ← CRITICAL!
  ...
})
```

**If broken:**
- Missing `credentials: 'include'` → Cookies not sent
- Browser won't send cookies with requests

---

### 5. **`server/routes/profile.js`** - Authentication Check
**Lines to check:**
- **Line 16-42**: `requireAuth` middleware
- **Line 80-110**: Onboarding endpoint

**What to verify:**
```javascript
// Line 17: Checks if authenticated
if (req.isAuthenticated()) {
  return next();
}
```

---

## 🔍 **Debugging Steps**

### Step 1: Check if Cookie is Set (After Login)
**File:** `server/routes/auth.js` line ~141

Look for in logs:
```
🍪 Set-Cookie header: present [value]
```

**If "missing":**
- Cookie isn't being set by server
- Check `server/index.js` session config
- Check if `req.session.save()` is called

### Step 2: Check if Cookie is Sent (On Next Request)
**File:** `server/routes/profile.js` line ~22

Look for in logs:
```
⚠️  Unauthenticated request: {
  cookies: 'present' or 'missing',
  hasOfaSidCookie: true/false
}
```

**If "missing" or `false`:**
- Browser isn't sending cookie
- Check browser DevTools → Application → Cookies
- Verify `ofa.sid` exists

### Step 3: Check Passport Data
**File:** `server/routes/auth.js` line ~112

Look for in logs:
```
🔍 Immediately after req.login: {
  hasPassport: true/false,
  passportUser: '[id]' or undefined
}
```

**If `hasPassport: false`:**
- `serializeUser` isn't working
- Check `server/config/passport.js` line 102

---

## 🎯 **Quick Fixes**

### Fix 1: Cookie Not Being Set
1. Check `server/routes/auth.js` - `req.session.save()` is called
2. Check `server/index.js` - Session config is correct
3. Check Render logs for session save errors

### Fix 2: Cookie Not Being Sent
1. Check `src/context/AuthContext.jsx` - All fetches have `credentials: 'include'`
2. Check browser DevTools → Application → Cookies → `ofa.sid` exists
3. Check CORS in `server/index.js` - `credentials: true`

### Fix 3: Passport Data Missing
1. Check `server/config/passport.js` - `serializeUser` is defined
2. Check logs for `📦 Serializing user to session:`
3. Check if `req.login()` is called in `server/routes/auth.js`

### Fix 4: Session Table Issues
1. Run: `node server/db/fix-session-table.js` in Render Shell
2. Check if session table exists in database
3. Check Render logs for session table errors

---

## 📋 **File Priority Order**

1. **`server/index.js`** - Session/CORS config (MOST IMPORTANT)
2. **`server/config/passport.js`** - Passport serialization
3. **`server/routes/auth.js`** - Login flow
4. **`src/context/AuthContext.jsx`** - Frontend cookie sending
5. **`server/routes/profile.js`** - Auth middleware

---

## 🚨 **Most Likely Issue**

Based on logs showing `cookies: 'missing'`:

**The cookie is not being sent by the browser.**

**Check:**
1. Browser DevTools → Application → Cookies → `wemanageall.in`
2. Look for `ofa.sid` cookie
3. If missing → Cookie wasn't set or was rejected
4. If present but not sent → CORS or `credentials: 'include'` issue

---

## ✅ **Verification Checklist**

- [ ] `server/index.js` line 66: `credentials: true` in CORS
- [ ] `server/index.js` line 137: `path: '/'` in cookie
- [ ] `server/index.js` line 136: `sameSite: 'lax'` in cookie
- [ ] `server/config/passport.js` line 102: `serializeUser` exists
- [ ] `server/routes/auth.js` line 105: `req.login()` is called
- [ ] `server/routes/auth.js` line 129: `req.session.save()` is called
- [ ] `src/context/AuthContext.jsx`: All fetches have `credentials: 'include'`
- [ ] Browser: `ofa.sid` cookie exists in DevTools
- [ ] Browser: Cookie has correct domain (`wemanageall.in`)
- [ ] Browser: Cookie has `Secure: true` (for HTTPS)

