import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import authService from '../services/authService';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    role: 'WAREHOUSE_STAFF',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
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

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      await authService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Start your journey to effortless inventory.
          </h1>
          <p className="mb-8 text-lg text-gray-300">
            Join thousands of businesses that have eliminated stockouts and optimized their supply chains with IMRAS.
          </p>
          <div className="space-y-4">
            {[
              { icon: 'check_circle', text: '14-day free trial, no credit card required' },
              { icon: 'check_circle', text: 'Full access to all features' },
              { icon: 'check_circle', text: 'Cancel anytime' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-400">
                  {item.icon}
                </span>
                <span className="text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-sm text-gray-400">© 2025 IMRAS Inc.</div>
      </div>

      {/* Right Side - Sign Up Form */}
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
              Create your account
            </h2>
            <p className="mt-2 text-sm text-[#4c669a] dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline transition-colors">
                Login
              </Link>
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
                htmlFor="fullName"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                  person
                </span>
                <input
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>
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
              <label
                className="block text-xs font-bold uppercase tracking-wider text-[#4c669a] dark:text-gray-500 mb-2"
                htmlFor="companyName"
              >
                Company Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                  business
                </span>
                <input
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                  id="companyName"
                  name="companyName"
                  placeholder="Acme Inc."
                  required
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-[#4c669a] dark:text-gray-500 mb-2"
                htmlFor="role"
              >
                Role
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                  badge
                </span>
                <select
                  className="w-full h-11 pl-10 pr-10 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0d121b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
                  <option value="INVENTORY_MANAGER">Inventory Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px] pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-[#4c669a] dark:text-gray-500 mb-2"
                htmlFor="password"
              >
                Password
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
                />
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-[#4c669a] dark:text-gray-500 mb-2"
                htmlFor="confirmPassword"
              >
                Confirm Password
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
                />
              </div>
            </div>
            <div className="flex items-start">
              <input
                className="h-4 w-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                required
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <label
                className="ml-2 block text-sm text-[#4c669a] dark:text-gray-400"
                htmlFor="agreeToTerms"
              >
                I agree to the{' '}
                <button type="button" className="text-primary hover:underline">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="text-primary hover:underline">
                  Privacy Policy
                </button>
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
