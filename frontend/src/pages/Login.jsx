import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import authService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
            Welcome back to smarter management.
          </h1>
          <p className="mb-8 text-lg text-gray-300">
            Access your inventory dashboard, check real-time stock levels, and
            manage your supply chain effortlessly.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <img
                alt="User"
                className="h-10 w-10 rounded-full border-2 border-[#0a0f18]"
                src="https://cdn.usegalileo.ai/stability/0f2a3f06-fa08-48b8-b3cc-e016036a8da9.png"
              />
              <img
                alt="User"
                className="h-10 w-10 rounded-full border-2 border-[#0a0f18]"
                src="https://cdn.usegalileo.ai/sdxl10/8f488030-67cf-40a7-9426-61984e8ffa7c.png"
              />
              <img
                alt="User"
                className="h-10 w-10 rounded-full border-2 border-[#0a0f18]"
                src="https://cdn.usegalileo.ai/stability/82a3c87d-40e8-4cb5-bf8a-c83c8f3fbc2c.png"
              />
            </div>
            <div className="text-sm font-medium text-gray-300">
              <span className="text-white font-bold">2,000+</span> companies trust us
            </div>
          </div>
        </div>
        <div className="relative z-10 text-sm text-gray-400">© 2025 IMRAS Inc.</div>
      </div>

      {/* Right Side - Login Form */}
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
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[#4c669a] dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-primary hover:underline transition-colors">
                Sign up
              </Link>
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
                Work Email
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
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-[#4c669a] dark:text-gray-500"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
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
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label
                className="ml-2 block text-sm text-[#4c669a] dark:text-gray-400"
                htmlFor="rememberMe"
              >
                Remember me for 30 days
              </label>
            </div>
            <div className="pt-2">
              <button
                className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-[#101622] text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-[#0d121b] dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              type="button"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-[#0d121b] dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              type="button"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                  fill="#000000"
                  className="dark:fill-white"
                />
              </svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
