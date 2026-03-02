/**
 * Passport.js Configuration
 * Configures Google OAuth 2.0 strategy
 */
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../config';
import User from '../models/User';

const configurePassport = (): void => {
  // Only configure Google OAuth if credentials are provided
  if (config.google.clientId && config.google.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.google.clientId,
          clientSecret: config.google.clientSecret,
          callbackURL: config.google.callbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
              return done(null, user);
            }

            // Check if user exists with same email
            const email = profile.emails?.[0]?.value;
            if (email) {
              user = await User.findOne({ email });
              if (user) {
                // Link Google account to existing user
                user.googleId = profile.id;
                user.avatar = profile.photos?.[0]?.value || user.avatar;
                await user.save();
                return done(null, user);
              }
            }

            // Create new user from Google profile
            user = await User.create({
              name: profile.displayName,
              email: email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || '',
              isEmailVerified: true, // Google emails are verified
            });

            return done(null, user);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  // Serialize user ID into session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;
