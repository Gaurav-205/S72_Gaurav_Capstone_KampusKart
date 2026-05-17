const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const PROD_BACKEND_URL = 'https://s72-gaurav-capstone-kampuskart.onrender.com';

// Determine the callback URL based on environment
const getCallbackURL = () => {
  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL}/api/auth/google/callback`;
  }
  if (process.env.NODE_ENV === 'production') {
    return `${PROD_BACKEND_URL}/api/auth/google/callback`;
  }
  return 'http://localhost:5000/api/auth/google/callback';
};

// Log the callback URL for debugging
console.log('Google OAuth Callback URL:', getCallbackURL());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: getCallbackURL(),
      proxy: true // Add this to handle proxy settings
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth profile:', profile);
        
        // Check if profile has emails
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error('No email found in Google profile'), null);
        }
        
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if user exists with the same email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.isEmailVerified = true;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              isEmailVerified: true,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 