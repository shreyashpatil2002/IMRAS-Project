import React from 'react';
import Header from '../components/Header';
import Logo from '../components/Logo';

const Home = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white transition-colors duration-200">
      <Header />
      
      {/* Hero Section */}
      <section className="w-full px-5 py-12 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col-reverse gap-10 lg:flex-row lg:items-center lg:gap-16">
            <div className="flex flex-1 flex-col gap-8 text-left">
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] lg:text-5xl xl:text-6xl text-[#0d121b] dark:text-white">
                  Powerful Features <br className="hidden lg:block" />Built for
                  Modern Inventory.
                </h1>
                <h2 className="text-lg font-normal leading-relaxed text-[#4c669a] dark:text-gray-400 max-w-xl">
                  Explore the comprehensive toolset within IMRAS designed to
                  automate your reordering, track every movement, and manage
                  your supply chain efficiently.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="flex h-12 min-w-[140px] cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700">
                  <span className="truncate">Start Free Trial</span>
                </button>
                <button className="flex h-12 min-w-[140px] cursor-pointer items-center justify-center rounded-lg bg-[#e7ebf3] px-6 text-base font-bold text-[#0d121b] hover:bg-[#dce3ef] dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors">
                  <span className="truncate">View Demo</span>
                </button>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div
                className="aspect-[4/3] w-full rounded-2xl bg-cover bg-center shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVPCjdHU_XOnwSJIySAwjzxroB6BztVCx0oYAH2u21n4pHBhD32EjamX-0eQs8jQGNiBF7HogLbLSBHFoSl8XeverMKCHNdso2q3pAcBqu9uj8w_lMYofZQq_jQgkNOObAriKN4qikleigEhFCxII3IgiQxTqXzNFVG_RD_4L7-ngqZ6a8tNLFZwasG6pN4ipOzvxnB3cU2sfuJP5xP-oU5XvDEnW1D1Y4-hDLH_5BqMZogWP1D1XgM2WAv7Oi0C6-3E-ridhkcA')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-5 py-16 lg:px-10 lg:py-24 bg-background-light dark:bg-background-dark border-t border-[#e7ebf3] dark:border-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 text-center">
            <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-2">
              Core Functionalities
            </h2>
            <h3 className="text-3xl font-black leading-tight tracking-tight md:text-4xl text-[#0d121b] dark:text-white">
              Everything you need to master your inventory
            </h3>
            <p className="text-base text-[#4c669a] dark:text-gray-400 max-w-2xl mx-auto">
              IMRAS provides a robust suite of tools to handle complex inventory
              challenges, from real-time tracking to supplier management.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: 'visibility',
                color: 'blue',
                title: 'Real-time Inventory Tracking',
                desc: 'Monitor stock levels across multiple locations instantly. Get live updates as items are received, sold, or transferred.'
              },
              {
                icon: 'smart_toy',
                color: 'indigo',
                title: 'Automated Reorder Suggestions',
                desc: 'AI-driven algorithms analyze usage patterns to suggest optimal reorder points, preventing stockouts and overstocking.'
              },
              {
                icon: 'qr_code_2',
                color: 'purple',
                title: 'Batch & Lot Management',
                desc: 'Track expiration dates and manage product recalls efficiently. Maintain full traceability with granular batch and lot tracking.'
              },
              {
                icon: 'local_shipping',
                color: 'teal',
                title: 'Supplier & PO Management',
                desc: 'Centralize supplier info, generate purchase orders in one click, and track delivery performance seamlessly within the platform.'
              },
              {
                icon: 'admin_panel_settings',
                color: 'orange',
                title: 'Role-Based Access',
                desc: 'Secure your operations. Assign specific permissions to users based on their roles (Admin, Manager, Warehouse Staff).'
              },
              {
                icon: 'bar_chart',
                color: 'rose',
                title: 'Reporting & Analytics',
                desc: 'Visualize sales trends, predict demand spikes, and optimize your supply chain with powerful, exportable analytics.'
              }
            ].map((feature, index) => (
              <div key={index} className={`group flex flex-col gap-4 rounded-xl border border-[#cfd7e7] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${feature.color}-100 text-${feature.color}-600 group-hover:bg-${feature.color}-600 group-hover:text-white transition-colors`}>
                  <span className="material-symbols-outlined text-[28px]">{feature.icon}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-xl font-bold leading-tight text-[#0d121b] dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-[#4c669a] dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="w-full px-5 py-16 lg:px-10 lg:py-24 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl flex flex-col gap-20">
          <div className="text-center max-w-3xl mx-auto mb-4">
            <h2 className="text-3xl font-black leading-tight tracking-tight md:text-4xl text-[#0d121b] dark:text-white mb-4">
              Seamless Integration into Your Workflow
            </h2>
            <p className="text-lg text-[#4c669a] dark:text-gray-400">
              Designed to fit the way you work, IMRAS connects the dots between
              inventory, sales, and procurement.
            </p>
          </div>
          <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
            <div className="w-full md:w-1/2">
              <div
                className="aspect-video w-full rounded-xl bg-gray-100 bg-cover bg-center shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDCkpH4lD3fSWG3PQPKRBCYfABhQh3pFvJqa1wGGJWzyc-jCVbc6lTQ2HIj3oHLbt44MQo6gNOyClwHD2nzTOp_jihbwHGlF4ZQ1RWqk6XUYcyt08xkh1SlY84t_v1ucexgaCaX4Vi9_ACFuyH1WP2C-GTwosF5y--J4rYlKlcUZoanNwx3Rq7-xiOu6zIRv9GC1mHWvbRwimAu_5DJXI-3g5ivN8OUwp29WmIaTtUjlFhR5usBDK5PqM5kYjApTQ49D8fXn_CjA')"
                }}
              ></div>
            </div>
            <div className="flex w-full flex-col gap-5 md:w-1/2">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white">
                Data-Driven Reordering
              </h3>
              <p className="text-base leading-relaxed text-[#4c669a] dark:text-gray-400">
                Stop guessing when to buy. IMRAS uses historical data and lead
                times to calculate the perfect reorder point.
              </p>
              <ul className="flex flex-col gap-3 pt-2">
                <li className="flex items-center gap-3 text-sm font-medium text-[#0d121b] dark:text-gray-300">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  Automatic Low Stock Alerts
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-[#0d121b] dark:text-gray-300">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  Demand Forecasting Models
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-[#0d121b] dark:text-gray-300">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  Supplier Lead Time Tracking
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center gap-10 md:flex-row-reverse md:gap-16">
            <div className="w-full md:w-1/2">
              <div
                className="aspect-video w-full rounded-xl bg-gray-100 bg-cover bg-center shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJSHyfvkUpMeiyLMqAOKwPuC9lmxdO4GbXFRDjGQvMnxJgYtGBJJGZ5WJ44ko324wZWXh_HEftdOohgVfDgXdpw_FohUqphf8hDMu6MV4uFKRG65DS0BWz3-XoFWHISBVuEa3Ug9TenWeovj1soHqWzXOoq9g3828eHW6gk5M3ON-c_NhUcwY-qPOkciowrUzac_m487M1YNkRQYQM9QyDJvzSKkLfOLeuyHqhJZ_jsSFD0JS3yUmm0E1WaoowKPYpdOSytK7AAw')"
                }}
              ></div>
            </div>
            <div className="flex w-full flex-col gap-5 md:w-1/2">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white">
                Collaborative Team Access
              </h3>
              <p className="text-base leading-relaxed text-[#4c669a] dark:text-gray-400">
                Empower your team without compromising security. Ensure the
                warehouse staff sees picking lists while management sees cost
                reports.
              </p>
              <ul className="flex flex-col gap-3 pt-2">
                <li className="flex items-center gap-3 text-sm font-medium text-[#0d121b] dark:text-gray-300">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  Custom User Roles & Permissions
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-[#0d121b] dark:text-gray-300">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  Activity Audit Logs
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-[#0d121b] dark:text-gray-300">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                  Multi-user Simultaneous Access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full overflow-hidden bg-primary py-20 px-5 text-center lg:px-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative mx-auto max-w-3xl flex flex-col items-center gap-6">
          <h2 className="text-3xl font-black text-white md:text-5xl">
            Ready to optimize your inventory?
          </h2>
          <p className="max-w-xl text-lg text-blue-100">
            Experience the full power of IMRAS features with a 14-day free
            trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
            <button className="flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-bold text-primary shadow-lg transition-transform hover:scale-105 hover:bg-gray-50">
              Start Free Trial
            </button>
            <button className="flex h-12 items-center justify-center rounded-lg border border-white/30 bg-primary/20 px-8 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-primary/40">
              Contact Sales
            </button>
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
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white" href="#">
                Features
              </a>
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white" href="#">
                Pricing
              </a>
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white" href="#">
                Integrations
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-[#0d121b] dark:text-white">
                Company
              </h4>
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white" href="#">
                About Us
              </a>
              <a className="text-sm text-[#4c669a] hover:text-primary dark:text-gray-400 dark:hover:text-white" href="#">
                Careers
              </a>
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
              © 2023 IMRAS Inc. All rights reserved.
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

export default Home;
