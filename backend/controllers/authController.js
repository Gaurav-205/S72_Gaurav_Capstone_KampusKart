const authService = require('../services/authService');
const { handleServiceError } = require('./controllerUtils');

const signup = async (req, res) => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error creating user');
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error logging in');
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const result = await authService.requestPasswordReset(req.body);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error processing request');
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error resetting password');
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await authService.refreshToken({ token });
    res.json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
};

const googleCallback = async (req, res) => {
  try {
    const redirectUrl = authService.buildGoogleRedirectUrl({ user: req.user });
    res.redirect(redirectUrl);
  } catch (error) {
    if (error.status === 500) {
      return res.redirect('/login?error=server_configuration');
    }
    res.redirect('/login?error=authentication_failed');
  }
};

const verifyEmail = async (req, res) => {
  try {
    const result = await authService.verifyEmail(req.query);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error verifying email');
  }
};

const resendVerification = async (req, res) => {
  try {
    const result = await authService.resendVerification(req.body);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error resending verification email');
  }
};

module.exports = {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  googleCallback,
  verifyEmail,
  resendVerification
};
