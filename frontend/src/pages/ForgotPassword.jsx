import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Don't worry, we've got you covered.
          </h1>
          <p className="mb-8 text-lg text-gray-300">
            Enter your email address and we'll send you a link to reset your password and get back to managing your inventory.
          </p>
        </div>
        <div className="relative z-10 text-sm text-gray-400">© 2025 IMRAS Inc.</div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="flex w-full flex-col justify-center bg-white dark:bg-[#101622] px-6 py-12 lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex lg:hidden items-center gap-3">
            <Logo />
            <h2 className="text-xl font-bold leading-tight text-[#0d121b] dark:text-white">
              IMRAS
            </h2>
          </div>
          
          {!isSubmitted ? (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-black tracking-tight text-[#0d121b] dark:text-white">
                  Forgot your password?
                </h2>
                <p className="mt-2 text-sm text-[#4c669a] dark:text-gray-400">
                  No worries, we'll send you reset instructions.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-[#4c669a] dark:text-gray-500 mb-2"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                      mail
                    </span>
                    <input
                      className="w-full h-11 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                      id="email"
                      name="email"
                      placeholder="name@company.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[40px]">
                    mark_email_read
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[#0d121b] dark:text-white mb-4">
                Check your email
              </h2>
              <p className="text-sm text-[#4c669a] dark:text-gray-400 mb-6">
                We've sent password reset instructions to <strong className="text-[#0d121b] dark:text-white">{email}</strong>
              </p>
              <p className="text-xs text-[#4c669a] dark:text-gray-400 mb-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-primary hover:underline font-medium"
                >
                  try another email address
                </button>
              </p>
            </div>
          )}

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

export default ForgotPassword;
