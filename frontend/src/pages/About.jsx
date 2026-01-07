import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Logo from '../components/Logo';

const About = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white transition-colors duration-200">
      <Header />
      
      {/* Hero Section */}
      <section className="w-full px-5 py-12 lg:px-10 lg:py-24 text-center bg-white dark:bg-gray-900 border-b border-[#e7ebf3] dark:border-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 items-center">
            <p className="text-primary font-bold tracking-wider uppercase text-sm">
              About IMRAS
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] lg:text-6xl text-[#0d121b] dark:text-white max-w-4xl">
              Revolutionizing Inventory<br />
              for Modern Commerce
            </h1>
            <h2 className="text-lg font-normal leading-relaxed text-[#4c669a] dark:text-gray-400 max-w-3xl mt-2">
              IMRAS was founded on a simple belief: that every business,
              regardless of size, deserves enterprise-grade inventory
              intelligence. We bridge the gap between complex supply chains and
              effortless management.
            </h2>
          </div>
          <div className="mt-12 lg:mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-background-light dark:bg-background-dark border border-[#e7ebf3] dark:border-gray-700">
              <div className="h-12 w-12 rounded-lg bg-blue-100 text-primary flex items-center justify-center mb-4 dark:bg-primary/20">
                <span className="material-symbols-outlined">rocket_launch</span>
              </div>
              <h3 className="text-xl font-bold text-[#0d121b] dark:text-white mb-2">
                Our Mission
              </h3>
              <p className="text-[#4c669a] dark:text-gray-400 text-sm leading-relaxed">
                To empower small and medium-sized businesses with automation
                tools that eliminate stockouts, reduce waste, and streamline
                reordering processes efficiently.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-background-light dark:bg-background-dark border border-[#e7ebf3] dark:border-gray-700">
              <div className="h-12 w-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4 dark:bg-purple-900/30 dark:text-purple-400">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <h3 className="text-xl font-bold text-[#0d121b] dark:text-white mb-2">
                Our Vision
              </h3>
              <p className="text-[#4c669a] dark:text-gray-400 text-sm leading-relaxed">
                A world where inventory management is invisible—where businesses
                can focus entirely on growth and customer satisfaction while we
                handle the logistics.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-background-light dark:bg-background-dark border border-[#e7ebf3] dark:border-gray-700">
              <div className="h-12 w-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-4 dark:bg-green-900/30 dark:text-green-400">
                <span className="material-symbols-outlined">diversity_3</span>
              </div>
              <h3 className="text-xl font-bold text-[#0d121b] dark:text-white mb-2">
                Our Values
              </h3>
              <p className="text-[#4c669a] dark:text-gray-400 text-sm leading-relaxed">
                Transparency in data, integrity in partnerships, and a
                relentless commitment to user-centric design are the pillars
                that support everything we build.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="w-full px-5 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-black leading-tight tracking-tight text-[#0d121b] dark:text-white lg:text-4xl">
                Solving the Chaos of<br />
                Manual Tracking
              </h2>
              <p className="text-base text-[#4c669a] dark:text-gray-400 leading-relaxed">
                Before IMRAS, many of our clients were drowning in spreadsheets,
                facing constant discrepancies between physical stock and digital
                records. This led to lost sales, frustrated customers, and
                wasted capital on dead stock.
              </p>
              <p className="text-base text-[#4c669a] dark:text-gray-400 leading-relaxed">
                We built IMRAS to be the single source of truth. By automating
                reorder points and synchronizing data across sales channels, we
                help operators reclaim hours of their day and thousands of
                dollars in revenue.
              </p>
              <div className="pt-4 grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-4xl font-black text-primary">99.9%</h4>
                  <p className="text-sm font-bold text-[#0d121b] dark:text-white mt-1">
                    Accuracy Rate
                  </p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-primary">2M+</h4>
                  <p className="text-sm font-bold text-[#0d121b] dark:text-white mt-1">
                    SKUs Tracked
                  </p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-primary">500+</h4>
                  <p className="text-sm font-bold text-[#0d121b] dark:text-white mt-1">
                    Active Businesses
                  </p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-primary">24/7</h4>
                  <p className="text-sm font-bold text-[#0d121b] dark:text-white mt-1">
                    System Uptime
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="relative w-full aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-90"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[120px]">inventory_2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline Section */}
      <section className="w-full px-5 py-16 lg:px-10 lg:py-24 bg-background-light dark:bg-background-dark border-t border-[#e7ebf3] dark:border-gray-800">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-[#0d121b] dark:text-white">
                Our Journey
              </h2>
              <p className="mt-4 text-[#4c669a] dark:text-gray-400">
                From concept to a comprehensive inventory management solution - Built in India.
              </p>
            </div>
            <div className="relative ml-4 md:ml-0 space-y-12">
              <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-primary/20 md:left-1/2 md:-ml-[1px]"></div>
              <div className="relative flex flex-col md:flex-row items-start md:items-center group">
                <div className="absolute -left-2 top-0 h-4 w-4 rounded-full border-2 border-white bg-primary shadow-sm dark:border-gray-900 md:left-1/2 md:-ml-2 md:top-1/2 md:-translate-y-1/2 z-10"></div>
                <div className="ml-8 md:ml-0 w-full md:w-1/2 md:pr-12 md:text-right">
                  <span className="text-sm font-bold text-primary">November 2025</span>
                  <h4 className="text-xl font-bold text-[#0d121b] dark:text-white mt-1">
                    Core Development Complete
                  </h4>
                  <p className="mt-2 text-[#4c669a] dark:text-gray-400 text-sm">
                    Built full-stack inventory management system with multi-warehouse support, batch tracking, purchase management, and automated reorder suggestions.
                  </p>
                </div>
                <div className="hidden md:block w-1/2 pl-12"></div>
              </div>
              <div className="relative flex flex-col md:flex-row items-start md:items-center group">
                <div className="absolute -left-2 top-0 h-4 w-4 rounded-full border-2 border-white bg-primary shadow-sm dark:border-gray-900 md:left-1/2 md:-ml-2 md:top-1/2 md:-translate-y-1/2 z-10"></div>
                <div className="hidden md:block w-1/2 pr-12"></div>
                <div className="ml-8 md:ml-0 md:pl-12 w-full md:w-1/2">
                  <span className="text-sm font-bold text-primary">December 2025</span>
                  <h4 className="text-xl font-bold text-[#0d121b] dark:text-white mt-1">
                    Testing & Refinement
                  </h4>
                  <p className="mt-2 text-[#4c669a] dark:text-gray-400 text-sm">
                    Extensive testing of all modules, bug fixes, UI/UX improvements, and role-based access control implementation with real-world scenarios.
                  </p>
                </div>
              </div>
              <div className="relative flex flex-col md:flex-row items-start md:items-center group">
                <div className="absolute -left-2 top-0 h-4 w-4 rounded-full border-2 border-white bg-primary shadow-sm dark:border-gray-900 md:left-1/2 md:-ml-2 md:top-1/2 md:-translate-y-1/2 z-10"></div>
                <div className="ml-8 md:ml-0 w-full md:w-1/2 md:pr-12 md:text-right">
                  <span className="text-sm font-bold text-primary">January 2026</span>
                  <h4 className="text-xl font-bold text-[#0d121b] dark:text-white mt-1">
                    Production Ready & Security Hardening
                  </h4>
                  <p className="mt-2 text-[#4c669a] dark:text-gray-400 text-sm">
                    Implemented enterprise-grade security with rate limiting, input sanitization, JWT authentication, and performance optimizations. Ready for deployment.
                  </p>
                </div>
                <div className="hidden md:block w-1/2 pl-12"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full overflow-hidden bg-primary py-20 px-5 text-center lg:px-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative mx-auto max-w-3xl flex flex-col items-center gap-6">
          <h2 className="text-3xl font-black text-white md:text-5xl">
            Ready to join us?
          </h2>
          <p className="max-w-xl text-lg text-blue-100">
            Whether you want to use our product or build it with us, we'd love
            to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
            <Link to="/pricing" className="flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-bold text-primary shadow-lg transition-transform hover:scale-105 hover:bg-gray-50">
              View Pricing
            </Link>
            <Link to="/" className="flex h-12 items-center justify-center rounded-lg border border-white/30 bg-primary/20 px-8 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-primary/40">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#e7ebf3] bg-background-light dark:bg-background-dark py-12 px-5 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#0d121b] dark:text-white">
                <Logo />
                <span className="text-xl font-bold">IMRAS</span>
              </div>
              <p className="text-sm text-[#4c669a] dark:text-gray-400 max-w-xs">
                The intelligent inventory management solution for modern
                businesses. Track, automate, and grow.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-[#0d121b] dark:text-white">
                Product
              </h4>
              <Link to="/" className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white">
                Features
              </Link>
              <Link to="/pricing" className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white">
                Pricing
              </Link>
              <Link to="/about" className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white">
                About
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-[#0d121b] dark:text-white">
                Company
              </h4>
              <Link to="/about" className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white">
                About Us
              </Link>
              <Link to="/pricing" className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white">
                Pricing
              </Link>
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white" href="#">
                Blog
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-[#0d121b] dark:text-white">
                Support
              </h4>
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white" href="#">
                Help Center
              </a>
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white" href="#">
                API Docs
              </a>
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white" href="#">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-[#e7ebf3] pt-8 md:flex-row dark:border-gray-800">
            <p className="text-sm text-[#4c669a] dark:text-gray-500">
              © 2025 IMRAS Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-500 dark:hover:text-white" href="#">
                Privacy Policy
              </a>
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-500 dark:hover:text-white" href="#">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
