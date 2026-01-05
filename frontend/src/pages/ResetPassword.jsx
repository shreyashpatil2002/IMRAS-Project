import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import authService from '../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(token, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col lg:flex-row overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Left Side - Brand Section */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between bg-[#0a0f18] p-12 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Inventory Warehouse"
            className="h-full w-full object-cover opacity-30 mix-blend-overlay"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC23ksuOBzmjiZnVodadlyZmuIQJFbadu-OCLaK0a7ekm2Ucnl32Oa2Kmoou3etUf5ZKmvdzHbQgNUMqamhuWva2K9ze0TCd60fDEwlxFbVknqO0d7J_18boAQiDeWLLXP6RL4O3v38CPAi376Hpm6TazWuKgAPFqYvc8oDO2aEwzgFV9q2DrHE-JzcFz5Hgi-e1XOiH7qZgzKaaHDaey_DKBP2pxJcTE4o8Kiu98s3-PvSZUFEF1Sz2Nxg2ZtbgzFHHzTWJJNF0g"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-black/80"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Logo className="size-8 text-white" />
            <h2 className="text-2xl font-bold tracking-tight">IMRAS</h2>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight">
            Secure your account with a new password.
          </h1>
          <p className="mb-8 text-lg text-gray-300">
            Choose a strong password to keep your inventory data safe and secure.
          </p>
        </div>
        <div className="relative z-10 text-sm text-gray-400">© 2026 IMRAS Inc.</div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex w-full flex-col justify-center bg-white dark:bg-[#101622] px-6 py-12 lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex lg:hidden items-center gap-3">
            <Logo />
            <h2 className="text-xl font-bold leading-tight text-[#0d121b] dark:text-white">
              IMRAS
            </h2>
          </div>
          
          <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tight text-[#0d121b] dark:text-white">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-[#4c669a] dark:text-gray-400">
              Enter your new password below.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-[#4c669a] dark:text-gray-500 mb-2"
                htmlFor="password"
              >
                New Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                  lock
                </span>
                <input
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-[#4c669a] dark:text-gray-500 mb-2"
                htmlFor="confirmPassword"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                  lock
                </span>
                <input
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={6}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
