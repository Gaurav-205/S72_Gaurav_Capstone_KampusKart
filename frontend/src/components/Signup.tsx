import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';


const imageUrl = '/login-side.jpg';

const RightPanel: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="hidden md:flex flex-1 items-center justify-center bg-gray-100 relative overflow-hidden">
      {!imageError ? (
        <img
          src={imageUrl}
          alt="Campus"
          className="object-cover w-full h-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center px-10 text-center bg-gradient-to-br from-[#181818] via-[#2B2B2B] to-[#00C6A7]">
          <h3 className="text-2xl font-extrabold text-white mb-3">Build Your Campus Network</h3>
          <p className="text-sm text-white/90 max-w-sm">
            Create your KampusKart account to access events, clubs, facilities, and real-time campus updates.
          </p>
        </div>
      )}
    </div>
  );
};

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateName = (name: string) => /^[A-Za-z\s]+$/.test(name);

const validatePassword = (password: string) => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/\d/.test(password)) errors.push('One number');
  if (!/[^A-Za-z\d\s]/.test(password)) errors.push('One special character');
  return errors;
};

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPasswordTips, setShowPasswordTips] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordErrors.length > 0 && val) {
      setPasswordErrors(validatePassword(val));
    }
  };

  const handlePasswordBlur = () => {
    if (password) {
      setPasswordErrors(validatePassword(password));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError && validateEmail(val)) {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    }
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);

    if (val && !validateName(val)) {
      setNameError('Full name can only contain letters and spaces');
    } else {
      setNameError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { setEmailError('Please enter a valid email address'); return; }
    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) { setPasswordErrors(pwErrors); return; }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!validateName(name)) {
      setNameError('Full name can only contain letters and spaces');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await signup(email, password, name, remember);
      navigate('/home');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to create account. Please try again.');
      } else {
        setError(err?.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-h-screen w-screen flex flex-col font-sans bg-white dark:bg-gray-950 overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Left: form */}
        <div className="auth-form-panel w-full md:w-1/2 px-4 sm:px-6 md:px-8 py-8 bg-white dark:bg-gray-900">
        <div className="auth-form-card w-full max-w-sm">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img src="/Logo.webp" alt="KampusKart Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
              <span className="text-xl sm:text-2xl font-extrabold text-black dark:text-white tracking-tight">KampusKart</span>
            </Link>
          </div>

          <h2 className="mb-2 text-2xl sm:text-3xl font-extrabold text-black dark:text-white text-center">Create an account</h2>
          <p className="text-sm sm:text-base text-gray-500 text-center mb-6 sm:mb-8">Join KampusKart today</p>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-200 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-400 transition-colors duration-200 min-h-touch"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                className={`w-full px-4 py-3 border-2 ${emailError ? 'border-red-400' : 'border-gray-200 dark:border-gray-800'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-400 transition-colors duration-200 min-h-touch`}
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
              />
              {emailError && <p className="mt-1.5 text-xs text-red-500">{emailError}</p>}
            </div>


              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full px-4 py-3 pr-12 border-2 ${passwordErrors.length > 0 ? 'border-red-400' : 'border-gray-200 dark:border-gray-800'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-400 transition-colors duration-200 min-h-touch`}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setShowPasswordTips(true)}
                  onBlur={handlePasswordBlur}
                />
                {emailError && <p className="mt-1.5 text-xs text-red-500">{emailError}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`w-full px-4 py-3 pr-12 border-2 ${passwordErrors.length > 0 ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent bg-white text-gray-900 text-base placeholder:text-gray-400 transition-colors duration-200 min-h-touch`}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setShowPasswordTips(true)}
                    onBlur={handlePasswordBlur}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200 bg-transparent p-2 border-0 min-h-touch min-w-touch"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {(showPasswordTips || passwordErrors.length > 0) && (
                  <ul className="mt-1.5 space-y-0.5">
                    {passwordErrors.length > 0 ? (
                      passwordErrors.map((e, i) => (
                        <li key={i} className="text-xs text-red-500">• {e}</li>
                      ))
                    ) : (
                      <li className="text-xs text-gray-500">Use at least 8 characters with uppercase, lowercase, number, and special character.</li>
                    )}
                  </ul>
                )}
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#00C6A7] focus:ring-[#00C6A7]"
                />
                Remember me
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-base font-bold text-white bg-[#181818] hover:bg-[#00C6A7] active:bg-[#181818] transition-colors duration-200 min-h-touch ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-400 font-medium">or continue with</span>
              </div>

            {/* Google */}
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 min-h-touch"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Sign up with Google
            </button>

              <p className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-[#F05A25] font-semibold hover:underline">Sign in</Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right: image */}
        <RightPanel />
      </div>
    </div>
  );
};

export default Signup;
