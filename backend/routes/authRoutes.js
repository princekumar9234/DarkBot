// ============================================
// Auth Routes - DarkBot (Email + OAuth)
// ============================================

const express = require('express');
const router  = express.Router();
const { signup, login, logout } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

// ─── Email Auth ───────────────────────────────────────────
router.post('/signup', authLimiter, signup);
router.post('/login',  authLimiter, login);
router.post('/logout', logout);

// ─── OAuth Routes (only active when env keys are set) ─────
try {
  const { passport, oauthSuccess } = require('../services/passportConfig');
  const passportMiddleware = passport.initialize();

  // -- Google --
  if (process.env.GOOGLE_CLIENT_ID) {
    router.get('/google',
      passportMiddleware,
      passport.authenticate('google', { scope: ['profile', 'email'], session: false })
    );
    router.get('/google/callback',
      passportMiddleware,
      passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_failed' }),
      oauthSuccess
    );
  }

  // -- GitHub --
  if (process.env.GITHUB_CLIENT_ID) {
    router.get('/github',
      passportMiddleware,
      passport.authenticate('github', { scope: ['user:email'], session: false })
    );
    router.get('/github/callback',
      passportMiddleware,
      passport.authenticate('github', { session: false, failureRedirect: '/login?error=github_failed' }),
      oauthSuccess
    );
  }

  // -- Twitter --
  if (process.env.TWITTER_CONSUMER_KEY) {
    router.get('/twitter',
      passportMiddleware,
      passport.authenticate('twitter', { session: false })
    );
    router.get('/twitter/callback',
      passportMiddleware,
      passport.authenticate('twitter', { session: false, failureRedirect: '/login?error=twitter_failed' }),
      oauthSuccess
    );
  }
} catch(e) {
  console.warn('⚠️  OAuth not configured:', e.message);
}

module.exports = router;
