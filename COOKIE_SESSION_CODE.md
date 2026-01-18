# Cookie & Session Configuration Code

This file contains all exact code responsible for cookie settings and session logic. Use this to diagnose why cookies are not being sent or sessions are expiring.

---

## File 1: `server/index.js`

### CORS Configuration (Lines 45-67)
```javascript
// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  'https://wemanageall.in',
  'https://www.wemanageall.in',
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Session Configuration (Lines 121-142)
```javascript
const sessionConfig = {
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: false, // Disable automatic pruning, let PostgreSQL handle it
  }),
  secret: process.env.SESSION_SECRET || 'ofa-life-os-secret-key-change-in-production',
  resave: true, // Force save session back to store even if not modified
  saveUninitialized: false, // Don't save uninitialized sessions
  name: 'ofa.sid', // Custom session name
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax', // Works for same-domain requests (wemanageall.in to wemanageall.in)
    path: '/', // Cookie available for all paths
    // Don't set domain - let browser use default (exact domain match)
  },
  // Ensure session is saved even if not modified
  rolling: false, // Don't reset expiration on every request
};
```

### Session Middleware Initialization (Lines 152-156)
```javascript
app.use(session(sessionConfig));

// Initialize Passport - MUST be after session middleware
app.use(passport.initialize());
app.use(passport.session());
```

### Passport Session Restoration Check (Lines 158-182)
```javascript
// Ensure passport session is properly restored
app.use((req, res, next) => {
  // Log cookie info for debugging
  const cookieHeader = req.headers.cookie || '';
  const hasOfaSid = cookieHeader.includes('ofa.sid');
  
  // If session exists but passport data is missing, try to restore it
  if (req.session && !req.session.passport && req.sessionID) {
    console.warn('⚠️  Session exists but passport data is missing. Session ID:', req.sessionID, {
      hasCookie: hasOfaSid,
      cookieHeader: cookieHeader.substring(0, 100)
    });
  }
  
  // If no cookie but session exists, log it
  if (req.session && !hasOfaSid && req.path.startsWith('/api/')) {
    console.warn('⚠️  Session exists but ofa.sid cookie is missing:', {
      path: req.path,
      sessionID: req.sessionID,
      cookies: req.headers.cookie ? 'present' : 'missing',
      cookieHeader: cookieHeader ? cookieHeader.substring(0, 100) : 'none',
      allCookies: cookieHeader.split(';').map(c => c.trim())
    });
  }
  
  next();
});
```

### Debug Middleware for Session State (Lines 184-199)
```javascript
// Debug middleware to log session state
app.use((req, res, next) => {
  // Only log for API routes to avoid spam
  if (req.path.startsWith('/api/') && req.method === 'POST') {
    console.log('📊 Request session state:', {
      path: req.path,
      hasSession: !!req.session,
      sessionID: req.sessionID,
      hasPassport: !!req.session?.passport,
      passportUser: req.session?.passport?.user,
      hasReqUser: !!req.user,
      isAuthenticated: req.isAuthenticated()
    });
  }
  next();
});
```

---

## File 2: `server/config/passport.js`

### User Serialization (Lines 101-109)
```javascript
// Serialize user for session storage (store only the user ID)
passport.serializeUser((user, done) => {
  console.log('📦 Serializing user to session:', {
    userId: user.id,
    userEmail: user.email,
    hasUser: !!user
  });
  done(null, user.id);
});
```

### User Deserialization (Lines 111-135)
```javascript
// Deserialize user from session (fetch full user profile)
passport.deserializeUser(async (id, done) => {
  try {
    console.log('🔍 Deserializing user from session, ID:', id);
    
    if (!id) {
      console.warn('⚠️  No user ID in session');
      return done(null, false);
    }
    
    const user = await getUserProfile(id);
    
    if (user) {
      console.log('✅ User deserialized successfully:', user.email);
      done(null, user);
    } else {
      console.warn('⚠️  User not found for ID:', id);
      done(null, false);
    }
  } catch (error) {
    console.error('❌ Passport deserialization error:', error.message);
    console.error('   Stack:', error.stack);
    done(error);
  }
});
```

---

## File 3: `server/routes/auth.js`

### Signup Route with Session Save (Lines 37-78)
```javascript
    // Log in the user immediately after signup
    req.login(user, (err) => {
      if (err) {
        console.error('Login after signup error:', err);
        return res.status(500).json({ error: 'Error logging in after signup.' });
      }
      
      // Verify passport data is in session
      console.log('🔍 After req.login (signup) - Session state:', {
        sessionID: req.sessionID,
        hasPassport: !!req.session.passport,
        passportUser: req.session.passport?.user,
        hasReqUser: !!req.user,
        isAuthenticated: req.isAuthenticated()
      });
      
      // Explicitly save the session to ensure it's persisted
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error after signup:', saveErr);
          return res.status(500).json({ error: 'Error saving session.' });
        }
        
        // Verify passport data is still there after save
        console.log('🔍 After session.save (signup) - Session state:', {
          sessionID: req.sessionID,
          hasPassport: !!req.session.passport,
          passportUser: req.session.passport?.user,
          hasReqUser: !!req.user,
          isAuthenticated: req.isAuthenticated()
        });
        
        console.log('✅ Session saved for new user:', user.email, 'Session ID:', req.sessionID);
        
        res.status(201).json({
          success: true,
          message: 'Account created successfully.',
          user,
          redirect: '/onboarding'
        });
      });
    });
```

### Login Route with Session Save (Lines 92-157)
```javascript
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ error: 'Authentication error.' });
    }
    
    if (!user) {
      return res.status(401).json({ 
        error: info?.message || 'Invalid email or password.' 
      });
    }
    
    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Error logging in.' });
      }
      
      // Check if passport data was set
      console.log('🔍 Immediately after req.login:', {
        sessionID: req.sessionID,
        hasPassport: !!req.session.passport,
        passportUser: req.session.passport?.user,
        fullSession: JSON.stringify(req.session).substring(0, 200)
      });
      
      // Wait a tick to ensure passport data is set
      process.nextTick(() => {
        // Check again after next tick
        console.log('🔍 After nextTick:', {
          sessionID: req.sessionID,
          hasPassport: !!req.session.passport,
          passportUser: req.session.passport?.user
        });
        
        // Explicitly save the session to ensure it's persisted
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ error: 'Error saving session.' });
          }
          
          // Verify passport data is still there after save
          console.log('🔍 After session.save:', {
            sessionID: req.sessionID,
            hasPassport: !!req.session.passport,
            passportUser: req.session.passport?.user
          });
          
          console.log('✅ Session saved for user:', user.email, 'Session ID:', req.sessionID);
          
          // Verify cookie is being set
          const setCookieHeader = res.getHeader('Set-Cookie');
          console.log('🍪 Set-Cookie header:', setCookieHeader ? 'present' : 'missing', setCookieHeader);
          
          // Determine redirect based on onboarding status
          const redirect = user.onboardingCompleted 
            ? '/welcome' 
            : '/onboarding';
          
          res.json({
            success: true,
            message: 'Login successful.',
            user,
            redirect
          });
        });
      });
    });
  })(req, res, next);
});
```

---

## File 4: `server/routes/profile.js`

### Authentication Middleware (Lines 16-44)
```javascript
/**
 * Middleware to ensure user is authenticated
 */
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Log detailed session info for debugging
  const cookieHeader = req.headers.cookie || '';
  const hasOfaSid = cookieHeader.includes('ofa.sid');
  
  console.warn('⚠️  Unauthenticated request:', {
    path: req.path,
    method: req.method,
    hasSession: !!req.session,
    sessionID: req.sessionID,
    sessionPassport: req.session?.passport,
    hasUser: !!req.user,
    userID: req.user?.id,
    isAuthenticated: req.isAuthenticated(),
    cookies: req.headers.cookie ? 'present' : 'missing',
    hasOfaSidCookie: hasOfaSid,
    cookieHeader: cookieHeader ? cookieHeader.substring(0, 100) : 'none',
    allCookies: cookieHeader.split(';').map(c => c.trim().substring(0, 30))
  });
  
  // Check if session has passport data but user isn't set
  if (req.session?.passport?.user) {
    console.warn('⚠️  Session has passport.user but req.user is not set:', req.session.passport.user);
    console.warn('   This suggests deserialization failed or is pending');
  }
  
  res.status(401).json({ error: 'Please log in to continue.' });
};
```

### Onboarding Route with Session Save (Lines 95-125)
```javascript
router.post('/onboarding', requireAuth, async (req, res) => {
  try {
    // Verify session is still valid
    if (!req.isAuthenticated() || !req.user) {
      console.error('❌ Session expired during onboarding request');
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    
    const { step, data } = req.body;
    
    if (typeof step !== 'number' || step < 0 || step > 7) {
      return res.status(400).json({ error: 'Invalid step number.' });
    }
    
    console.log(`📝 Saving onboarding step ${step} for user ${req.user.id}`);
    
    const profile = await updateOnboardingStep(req.user.id, step, data);
    
    // Ensure session is saved after update
    req.session.save((err) => {
      if (err) {
        console.error('Session save error after onboarding:', err);
        return res.status(500).json({ error: 'Error saving session after onboarding.' });
      }
      console.log('✅ Session saved after onboarding for user:', req.user.email, 'Session ID:', req.sessionID);
      res.json({
        success: true,
        profile,
        completed: profile.onboardingCompleted
      });
    });
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({ error: 'Failed to update onboarding progress.' });
  }
});
```

---

## File 5: `src/context/AuthContext.jsx`

### Check Auth with Credentials (Lines 14-18)
```javascript
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
```

### Login with Credentials (Lines 60-67)
```javascript
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
```

### Update Onboarding with Credentials (Lines 198-204)
```javascript
  const updateOnboarding = async (step, data) => {
    const response = await fetch('/api/profile/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ step, data }),
    });
```

---

## Key Configuration Points

### Cookie Attributes:
- **name**: `'ofa.sid'` (custom session name)
- **secure**: `true` in production (HTTPS only)
- **httpOnly**: `true` (not accessible via JavaScript)
- **sameSite**: `'lax'` (allows same-site requests)
- **path**: `'/'` (available for all paths)
- **maxAge**: `7 * 24 * 60 * 60 * 1000` (7 days)
- **domain**: NOT SET (browser uses exact domain match)

### Session Store:
- **store**: PostgreSQL via `connect-pg-simple`
- **tableName**: `'session'`
- **createTableIfMissing**: `true`
- **resave**: `true` (force save even if not modified)
- **saveUninitialized**: `false` (don't save empty sessions)
- **rolling**: `false` (don't reset expiration on every request)

### CORS:
- **credentials**: `true` (allows cookies to be sent)
- **origin**: Dynamic check against allowed origins

### Critical Flow:
1. User logs in → `req.login()` called
2. Passport serializes user ID → stored in `req.session.passport.user`
3. `req.session.save()` explicitly called to persist
4. Cookie `ofa.sid` should be set in response header
5. Browser should send `ofa.sid` cookie on subsequent requests
6. Passport deserializes user ID → fetches full user profile
7. `req.isAuthenticated()` returns `true` if user exists

---

## Common Issues to Check

1. **Cookie not being set**: Check `Set-Cookie` header in response after login
2. **Cookie not being sent**: Check `Cookie` header in subsequent requests
3. **Session ID changes**: Indicates new session created (cookie not recognized)
4. **Passport data missing**: Session exists but `req.session.passport` is undefined
5. **Deserialization fails**: User ID in session but user not found in database
6. **CORS blocking**: Browser blocks cookie due to CORS policy
7. **Secure cookie on HTTP**: `secure: true` requires HTTPS
8. **Domain mismatch**: Cookie domain doesn't match request domain
9. **Path mismatch**: Cookie path doesn't match request path
10. **SameSite blocking**: `sameSite: 'strict'` blocks cross-site requests

