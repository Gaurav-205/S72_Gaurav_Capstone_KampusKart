const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAdminEmail } = require('../utils/adminUtils');

const authMiddleware = async (req, res, next) => {
  // Validate JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (excluding password)
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user.isAdmin = isAdminEmail(req.user.email);

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      return next();
    }

    const token = req.headers.authorization.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');

    if (user) {
      user.isAdmin = isAdminEmail(user.email);
      req.user = user;
    }

    next();
  } catch (error) {
    next();
  }
};

const requireAdmin = (message = 'Admin access required') => {
  return (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        message,
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireAdmin,
};
