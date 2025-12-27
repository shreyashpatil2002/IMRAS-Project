import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import authService from '../services/authService';

const DashboardLayout = ({ children, title }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar />
      
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#e7ebf3] dark:border-gray-800 bg-surface-light dark:bg-surface-dark px-6 py-3 shadow-sm z-10">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden text-gray-500">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">
              {title}
            </h2>
            <div className="hidden md:flex items-center max-w-md w-full ml-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border-none rounded-lg bg-gray-100 dark:bg-gray-800 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Search for SKU, Order ID, or Product..."
                  type="text"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1.5 rounded-lg transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{user?.name || 'Guest'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mt-1">{user?.role || 'User'}</p>
              </div>
              <div className="size-9 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover bg-primary text-white flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
