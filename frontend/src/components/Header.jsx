import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e7ebf3] bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-5 py-3 lg:px-10">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-4 text-[#0d121b] dark:text-white" onClick={closeMenu}>
          <Logo />
          <h2 className="text-lg sm:text-xl font-bold leading-tight tracking-[-0.015em]">
            IMRAS
          </h2>
        </Link>
        
        {/* Desktop Navigation */}
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
        
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
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

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#e7ebf3] dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[#0d121b] dark:text-white">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background-light dark:bg-background-dark border-b border-[#e7ebf3] dark:border-gray-800 shadow-lg">
          <nav className="flex flex-col py-4 px-5">
            <Link
              to="/"
              onClick={closeMenu}
              className={`py-3 px-4 text-base font-${isActive('/') ? 'bold text-primary' : 'medium hover:text-primary'} transition-colors rounded-lg hover:bg-[#e7ebf3] dark:hover:bg-gray-800`}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              onClick={closeMenu}
              className={`py-3 px-4 text-base font-${isActive('/pricing') ? 'bold text-primary' : 'medium hover:text-primary'} transition-colors rounded-lg hover:bg-[#e7ebf3] dark:hover:bg-gray-800`}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className={`py-3 px-4 text-base font-${isActive('/about') ? 'bold text-primary' : 'medium hover:text-primary'} transition-colors rounded-lg hover:bg-[#e7ebf3] dark:hover:bg-gray-800`}
            >
              About
            </Link>
            <div className="border-t border-[#e7ebf3] dark:border-gray-800 my-3"></div>
            <Link
              to="/login"
              onClick={closeMenu}
              className="mx-4 mb-2 flex items-center justify-center rounded-lg h-11 px-4 bg-transparent border border-[#e7ebf3] hover:bg-[#e7ebf3] dark:border-gray-700 dark:hover:bg-gray-800 text-[#0d121b] dark:text-white text-base font-bold transition-all"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={closeMenu}
              className="mx-4 flex items-center justify-center rounded-lg h-11 px-4 bg-primary hover:bg-blue-700 text-white text-base font-bold shadow-md transition-all"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
