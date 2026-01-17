import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findUserByEmail, findUserById, getUserProfile, verifyPassword, createOrUpdateGoogleUser } from '../models/user.js';

/**
 * Passport.js Configuration for Email/Password and Google OAuth Authentication
 * Using PostgreSQL for user storage
 */

// Local Strategy for email/password login
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Find user by email
      const user = await findUserByEmail(email.toLowerCase());
      
      if (!user) {
        return done(null, false, { message: 'No account found with that email.' });
      }
      
      // Verify password
      const isMatch = await verifyPassword(password, user.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      // Get full user profile
      const profile = await getUserProfile(user.id);
      
      return done(null, profile);
      
    } catch (error) {
      console.error('Passport authentication error:', error);
      return done(error);
    }
  }
));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails, photos } = profile;
        const email = emails && emails[0] ? emails[0].value : null;
        const photo = photos && photos[0] ? photos[0].value : null;

        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        // Create or update user
        const user = await createOrUpdateGoogleUser({
          googleId: id,
          name: displayName,
          email: email.toLowerCase(),
          photo: photo
        });

        // Get full user profile
        const fullProfile = await getUserProfile(user.id);
        
        return done(null, fullProfile);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  ));
} else {
  console.warn('⚠️  Google OAuth credentials not found. Google login will be disabled.');
}

// Serialize user for session storage (store only the user ID)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session (fetch full user profile)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserProfile(id);
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    console.error('Passport deserialization error:', error);
    done(error);
  }
});

export default passport;
