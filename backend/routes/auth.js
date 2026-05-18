const express = require('express');
const router = express.Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');

const {
  validateSignup,
  validateLogin,
  sanitizeInput
} = require('../middleware/validation');
const authController = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many signup attempts, please try again after an hour' }
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many password reset requests, please try again after an hour' }
});

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many password reset attempts, please try again after an hour' }
});

router.get('/google', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      session: false,
      failureRedirect: '/login'
    })(req, res, next);
  },
  authController.googleCallback
);

router.post('/signup', signupLimiter, sanitizeInput, validateSignup, authController.signup);
router.post('/login', loginLimiter, sanitizeInput, validateLogin, authController.login);
router.post('/forgot-password', forgotPasswordLimiter, authController.requestPasswordReset);
router.post('/reset-password', resetPasswordLimiter, authController.resetPassword);
router.post('/refresh', authController.refreshToken);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

module.exports = router;
