import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Header = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e7ebf3] bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-5 py-3 lg:px-10">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-4 text-[#0d121b] dark:text-white">
          <Logo />
          <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">
            IMRAS
          </h2>
        </Link>
        
        <nav className="hidden md:flex items-center gap-9">
          <Link
            to="/"
            className={`text-sm font-${isActive('/') ? 'bold text-primary' : 'medium hover:text-primary'} transition-colors`}
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className={`text-sm font-${isActive('/pricing') ? 'bold text-primary' : 'medium hover:text-primary'} transition-colors`}
          >
            Pricing
          </Link>
          <Link
            to="/about"
            className={`text-sm font-${isActive('/about') ? 'bold text-primary' : 'medium hover:text-primary'} transition-colors`}
          >
            About
          </Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-transparent border border-[#e7ebf3] hover:bg-[#e7ebf3] dark:border-gray-700 dark:hover:bg-gray-800 text-[#0d121b] dark:text-white text-sm font-bold transition-all"
          >
            <span className="truncate">Login</span>
          </Link>
          <Link
            to="/signup"
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all"
          >
            <span className="truncate">Sign Up</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
