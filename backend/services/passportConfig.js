// ============================================
// Passport OAuth Configuration - DarkBot
// ============================================

const passport         = require('passport');
const GoogleStrategy   = require('passport-google-oauth20').Strategy;
const GitHubStrategy   = require('passport-github2').Strategy;
const TwitterStrategy  = require('passport-twitter').Strategy;
const User             = require('../models/User');
const jwt              = require('jsonwebtoken');

const FRONTEND = process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL || 'http://localhost:5173'
  : 'http://localhost:5173';

// ── Serialise / Deserialise (required by passport) ──
passport.serializeUser((user, done)   => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); }
  catch (e) { done(e); }
});

// ─────────────────────────────────────────────
// Helper: find-or-create an OAuth user
// ─────────────────────────────────────────────
async function findOrCreate({ email, name, avatar, provider }) {
  let user = await User.findOne({ email });
  if (!user) {
    // Create with a random password (user will login via OAuth only)
    const random = require('crypto').randomBytes(32).toString('hex');
    user = await User.create({
      name,
      email,
      password: random,       // won't be used
      avatar:   avatar || '',
      oauthProvider: provider,
    });
  }
  return user;
}

// ─────────────────────────────────────────────
// Google Strategy
// ─────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email  = profile.emails?.[0]?.value || `${profile.id}@google.oauth`;
        const avatar = profile.photos?.[0]?.value || '';
        const user   = await findOrCreate({ email, name: profile.displayName, avatar, provider:'google' });
        done(null, user);
      } catch (e) { done(e); }
    }
  ));
}

// ─────────────────────────────────────────────
// GitHub Strategy
// ─────────────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy(
    {
      clientID:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email  = profile.emails?.[0]?.value || `${profile.id}@github.oauth`;
        const avatar = profile.photos?.[0]?.value || '';
        const user   = await findOrCreate({ email, name: profile.displayName || profile.username, avatar, provider:'github' });
        done(null, user);
      } catch (e) { done(e); }
    }
  ));
}

// ─────────────────────────────────────────────
// Twitter Strategy (Twitter v1.1)
// ─────────────────────────────────────────────
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  passport.use(new TwitterStrategy(
    {
      consumerKey:    process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL:    `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/twitter/callback`,
      includeEmail:   true,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        const email  = profile.emails?.[0]?.value || `${profile.id}@twitter.oauth`;
        const avatar = profile.photos?.[0]?.value?.replace('_normal','') || '';
        const user   = await findOrCreate({ email, name: profile.displayName, avatar, provider:'twitter' });
        done(null, user);
      } catch (e) { done(e); }
    }
  ));
}

// ─────────────────────────────────────────────
// After success: create JWT and redirect to frontend
// ─────────────────────────────────────────────
function oauthSuccess(req, res) {
  if (!req.user) return res.redirect(`${FRONTEND}/login?error=oauth_failed`);
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.redirect(`${FRONTEND}/`);
}

module.exports = { passport, oauthSuccess };
