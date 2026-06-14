import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { API_BASE } from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request_otp' | 'reset_password'>('request_otp');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep('reset_password');
        setCountdown(300); // 5 minutes
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password. Please check your OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 font-sans">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img src="/Logo.webp" alt="KampusKart Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
              <span className="text-lg sm:text-xl font-extrabold text-black dark:text-white tracking-tight">KampusKart</span>
            </Link>
        </div>

        <h2 className="mb-1 text-xl sm:text-2xl font-extrabold text-black dark:text-white text-center">
          {step === 'request_otp' ? 'Forgot Password' : 'Reset Password'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 text-center mb-6 sm:mb-8">
          {step === 'request_otp' 
            ? 'Enter your email to receive a reset code' 
            : 'Enter the OTP and your new password'}
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-200 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="mb-4 rounded-lg bg-green-50 border-2 border-green-200 p-3">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        {step === 'request_otp' ? (
          <form className="space-y-4 sm:space-y-5" onSubmit={handleRequestOtp}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-3 sm:py-2.5 border-2 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-400 transition-colors duration-200 min-h-touch"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-sm sm:text-base font-bold text-white bg-[#181818] hover:bg-[#00C6A7] active:bg-[#181818] transition-colors duration-200 min-h-touch ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Remember your password?{' '}
              <Link to="/login" className="text-[#F05A25] font-semibold hover:underline">Sign in</Link>
            </p>
          </form>
        ) : (
          <form className="space-y-4 sm:space-y-5" onSubmit={handleResetPassword}>
            {countdown > 0 && (
              <div className="text-center text-xs text-gray-500 mb-2">
                OTP expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">OTP Code</label>
              <input
                type="text"
                required
                className="w-full px-3 py-3 sm:py-2.5 border-2 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-400 transition-colors duration-200 min-h-touch"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-3 sm:py-2.5 pr-12 border-2 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-400 transition-colors duration-200 min-h-touch"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200 bg-transparent p-2 border-0 min-h-touch min-w-touch"
                  onClick={() => setShowNewPassword(v => !v)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-3 sm:py-2.5 pr-12 border-2 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-400 transition-colors duration-200 min-h-touch"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200 bg-transparent p-2 border-0 min-h-touch min-w-touch"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-sm sm:text-base font-bold text-white bg-[#181818] hover:bg-[#00C6A7] active:bg-[#181818] transition-colors duration-200 min-h-touch ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('request_otp');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
                setMessage('');
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Back to email entry
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
