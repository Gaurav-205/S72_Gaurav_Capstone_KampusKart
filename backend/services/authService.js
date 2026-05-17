const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const { isAdminEmail } = require('../utils/adminUtils');
const { ServiceError } = require('./serviceError');

let transporter = null;
try {
  if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
} catch (error) {
  transporter = null;
}

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new ServiceError('Server configuration error', 500);
  }
};

const createToken = (userId) => {
  ensureJwtSecret();
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const signup = async ({ email, password, name }) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await userRepository.findByEmail(normalizedEmail);
  if (existingUser) {
    throw new ServiceError('User already exists', 400);
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  const user = await userRepository.create({
    email: normalizedEmail,
    password,
    name: name.trim(),
    isEmailVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  const frontendUrl = (
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://kampuskart.netlify.app'
      : 'http://localhost:3000')
  ).replace(/\/$/, '');

  const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

  console.log('\n--- VERIFICATION LINK (For testing without email setup) ---');
  console.log(verifyUrl);
  console.log('-----------------------------------------------------------\n');

  if (transporter) {
    try {
      await transporter.sendMail({
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Verify your KampusKart email address',
        text: `Please verify your email address by clicking the following link:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }

  return {
    message: 'Registration successful. Please check your email to verify your account.',
    requireVerification: true
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);
  if (!user) {
    throw new ServiceError('Invalid credentials', 400);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ServiceError('Invalid credentials', 400);
  }

  if (!user.isEmailVerified) {
    throw new ServiceError('Please verify your email to log in', 403);
  }

  const token = createToken(user._id);
  const isAdmin = isAdminEmail(user.email);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      isAdmin
    }
  };
};

const requestPasswordReset = async ({ email }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);
  if (!user) {
    return { message: 'If that email is registered, an OTP has been sent' };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  user.resetPasswordOTP = hashedOtp;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  if (!transporter) {
    return { message: 'If that email is registered, an OTP has been sent' };
  }

  try {
    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. This OTP is valid for 15 minutes.`
    });

    return { message: 'If that email is registered, an OTP has been sent' };
  } catch (error) {
    throw new ServiceError('Error sending email. Please try again later.', 500);
  }
};

const resetPassword = async ({ email, otp, newPassword }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);
  if (!user) {
    throw new ServiceError('User not found', 404);
  }

  const now = Date.now();
  if (!user.resetPasswordOTP || !user.resetPasswordExpires || user.resetPasswordExpires < now) {
    throw new ServiceError('Invalid or expired OTP', 400);
  }

  const hashedProvidedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  if (user.resetPasswordOTP.length !== hashedProvidedOtp.length) {
    throw new ServiceError('Invalid or expired OTP', 400);
  }

  try {
    const otpMatch = crypto.timingSafeEqual(
      Buffer.from(user.resetPasswordOTP, 'hex'),
      Buffer.from(hashedProvidedOtp, 'hex')
    );

    if (!otpMatch) {
      throw new ServiceError('Invalid or expired OTP', 400);
    }
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError('Invalid or expired OTP', 400);
  }

  user.password = newPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: 'Password reset successfully' };
};

const refreshToken = async ({ token }) => {
  if (!token) {
    throw new ServiceError('No token provided', 401);
  }

  ensureJwtSecret();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return { token: newToken };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ServiceError('Token expired', 401);
    }
    throw new ServiceError('Invalid token', 401);
  }
};

const buildGoogleRedirectUrl = ({ user }) => {
  const token = createToken(user._id);
  const frontendUrl = (
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://kampuskart.netlify.app'
      : 'http://localhost:3000')
  ).replace(/\/$/, '');

  return `${frontendUrl}/auth/google/callback?token=${token}`;
};

const verifyEmail = async ({ token }) => {
  if (!token) {
    throw new ServiceError('Invalid or missing verification token', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await userRepository.findByVerificationToken(hashedToken);

  if (!user) {
    throw new ServiceError('Invalid or expired verification token', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { message: 'Email verified successfully' };
};

const resendVerification = async ({ email }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);
  
  if (!user) {
    throw new ServiceError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new ServiceError('Email is already verified', 400);
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  const frontendUrl = (
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://kampuskart.netlify.app'
      : 'http://localhost:3000')
  ).replace(/\/$/, '');

  const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

  console.log('\n--- VERIFICATION LINK (For testing without email setup) ---');
  console.log(verifyUrl);
  console.log('-----------------------------------------------------------\n');

  if (transporter) {
    try {
      await transporter.sendMail({
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Verify your KampusKart email address',
        text: `Please verify your email address by clicking the following link:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new ServiceError('Error sending email. Please try again later.', 500);
    }
  }

  return { message: 'Verification email resent successfully' };
};

module.exports = {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  buildGoogleRedirectUrl,
  verifyEmail,
  resendVerification
};
