import React, { useState } from 'react';
import Header from '../components/Header';
import Logo from '../components/Logo';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const plans = [
    {
      name: 'Basic',
      description: 'Essential tools for small businesses.',
      price: { monthly: 29, yearly: 23 },
      buttonText: 'Start Free Trial',
      buttonClass: 'bg-primary/10 text-primary hover:bg-primary hover:text-white',
      features: [
        'Up to 1,000 SKUs',
        '1 User Seat',
        'Basic Reporting',
        'Email Support'
      ]
    },
    {
      name: 'Pro',
      description: 'Advanced features for growing teams.',
      price: { monthly: 79, yearly: 63 },
      buttonText: 'Get Started',
      buttonClass: 'bg-primary text-white shadow-lg hover:scale-105 hover:bg-blue-700',
      popular: true,
      scale: true,
      features: [
        'Unlimited SKUs',
        '5 User Seats',
        'Auto-Reorder Suggestions',
        'Batch & Lot Tracking',
        'Priority Support'
      ]
    },
    {
      name: 'Enterprise',
      description: 'Full control for large organizations.',
      price: 'Custom',
      buttonText: 'Contact Sales',
      buttonClass: 'bg-primary/10 text-primary hover:bg-primary hover:text-white',
      features: [
        'Unlimited Everything',
        'Unlimited Users',
        'Advanced Analytics',
        'API Access',
        'Dedicated Account Manager',
        '24/7 Phone Support'
      ]
    }
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white transition-colors duration-200">
      <Header />
      
      {/* Hero Section */}
      <section className="w-full px-5 py-12 lg:px-10 lg:py-20 text-center bg-white dark:bg-gray-900 border-b border-[#e7ebf3] dark:border-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 items-center">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] lg:text-6xl text-[#0d121b] dark:text-white max-w-4xl">
              Simple, Transparent Pricing<br />
              for Modern Inventory.
            </h1>
            <h2 className="text-lg font-normal leading-relaxed text-[#4c669a] dark:text-gray-400 max-w-2xl">
              Choose the plan that fits your business size and complexity. No
              hidden fees, cancel anytime.
            </h2>
            <div className="flex items-center gap-4 mt-4 bg-white dark:bg-gray-800 p-1 rounded-full border border-[#e7ebf3] dark:border-gray-700 shadow-sm">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-[#4c669a] dark:text-gray-400 hover:text-[#0d121b] dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-[#4c669a] dark:text-gray-400 hover:text-[#0d121b] dark:hover:text-white'
                }`}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="w-full px-5 pb-16 lg:px-10 lg:pb-24 -mt-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative flex flex-col rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-gray-800 dark:hover:shadow-2xl hover:-translate-y-1 ${
                  plan.popular
                    ? 'border-2 border-primary scale-105 z-10'
                    : 'border border-[#e7ebf3] dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                    Most Popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#4c669a] dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6 flex items-baseline gap-1">
                  {typeof plan.price === 'object' ? (
                    <>
                      <span className="text-4xl font-black text-[#0d121b] dark:text-white">
                        ${plan.price[billingPeriod]}
                      </span>
                      <span className="text-base font-medium text-[#4c669a] dark:text-gray-400">
                        /month
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-black text-[#0d121b] dark:text-white">
                      {plan.price}
                    </span>
                  )}
                </div>
                <button className={`mb-8 w-full rounded-lg py-3 text-sm font-bold transition-all ${plan.buttonClass}`}>
                  {plan.buttonText}
                </button>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#4c669a] dark:text-gray-500">
                    {index === 1 ? 'Everything in Basic, plus:' : 'Features'}
                  </p>
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-[#0d121b] dark:text-gray-300">
                        <span className="material-symbols-outlined text-[20px] text-green-500">
                          check
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="w-full bg-background-light dark:bg-background-dark border-t border-[#e7ebf3] dark:border-gray-800 py-16 lg:py-24 px-5 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="flex flex-col gap-6">
              <h2 className="text-primary font-bold tracking-wider uppercase text-sm">
                Comparison
              </h2>
              <h3 className="text-3xl font-black leading-tight tracking-tight text-[#0d121b] dark:text-white">
                Compare Features
              </h3>
              <p className="text-base text-[#4c669a] dark:text-gray-400 max-w-lg">
                Dive deeper into what makes each plan unique. Whether you are
                just starting or scaling up, we have the right set of tools for
                you.
              </p>
              <div className="mt-4">
                <button className="flex items-center gap-2 text-primary font-bold hover:underline">
                  Download full feature list PDF
                  <span className="material-symbols-outlined text-sm">download</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e7ebf3] dark:border-gray-700">
                    <th className="py-4 pr-4 text-sm font-bold text-[#0d121b] dark:text-white w-1/3">
                      Feature
                    </th>
                    <th className="py-4 px-4 text-sm font-bold text-[#0d121b] dark:text-white text-center w-1/5">
                      Basic
                    </th>
                    <th className="py-4 px-4 text-sm font-bold text-primary text-center w-1/5">
                      Pro
                    </th>
                    <th className="py-4 pl-4 text-sm font-bold text-[#0d121b] dark:text-white text-center w-1/5">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ebf3] dark:divide-gray-800">
                  <tr>
                    <td className="py-4 pr-4 text-sm text-[#0d121b] dark:text-gray-300">
                      Inventory Locations
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-[#4c669a] dark:text-gray-400">
                      1
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-[#0d121b] font-bold dark:text-white">
                      Unlimited
                    </td>
                    <td className="py-4 pl-4 text-center text-sm text-[#0d121b] dark:text-white">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-sm text-[#0d121b] dark:text-gray-300">
                      Purchase Orders
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-[#4c669a] dark:text-gray-400">
                      50/mo
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-[#0d121b] font-bold dark:text-white">
                      Unlimited
                    </td>
                    <td className="py-4 pl-4 text-center text-sm text-[#0d121b] dark:text-white">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-sm text-[#0d121b] dark:text-gray-300">
                      Audit Logs
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-[#4c669a] dark:text-gray-400">
                      30 days
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-[#0d121b] font-bold dark:text-white">
                      1 Year
                    </td>
                    <td className="py-4 pl-4 text-center text-sm text-[#0d121b] dark:text-white">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-sm text-[#0d121b] dark:text-gray-300">
                      API Access
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-[#4c669a] dark:text-gray-400">
                      -
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-[#0d121b] font-bold dark:text-white">
                      Read Only
                    </td>
                    <td className="py-4 pl-4 text-center text-sm text-[#0d121b] dark:text-white">
                      Full Access
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full px-5 py-16 lg:px-10 lg:py-24 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0d121b] dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-[#4c669a] dark:text-gray-400">
              Everything you need to know about the product and billing.
            </p>
          </div>
          <div className="space-y-6">
            <div className="rounded-xl border border-[#e7ebf3] bg-[#fcfcfd] p-6 dark:border-gray-800 dark:bg-gray-800/50">
              <h4 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2">
                Can I switch plans later?
              </h4>
              <p className="text-base text-[#4c669a] dark:text-gray-400">
                Yes, absolutely. You can upgrade or downgrade your plan at any
                time from your account settings. Prorated charges will apply
                automatically.
              </p>
            </div>
            <div className="rounded-xl border border-[#e7ebf3] bg-[#fcfcfd] p-6 dark:border-gray-800 dark:bg-gray-800/50">
              <h4 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2">
                Is there a setup fee?
              </h4>
              <p className="text-base text-[#4c669a] dark:text-gray-400">
                No, there are no setup fees for our Basic and Pro plans.
                Enterprise plans may involve a one-time onboarding fee depending
                on the complexity of the deployment.
              </p>
            </div>
            <div className="rounded-xl border border-[#e7ebf3] bg-[#fcfcfd] p-6 dark:border-gray-800 dark:bg-gray-800/50">
              <h4 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-base text-[#4c669a] dark:text-gray-400">
                We accept all major credit cards (Visa, Mastercard, American
                Express) for monthly subscriptions. For yearly Enterprise
                contracts, we can accept wire transfers.
              </p>
            </div>
            <div className="rounded-xl border border-[#e7ebf3] bg-[#fcfcfd] p-6 dark:border-gray-800 dark:bg-gray-800/50">
              <h4 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2">
                Do you offer a free trial?
              </h4>
              <p className="text-base text-[#4c669a] dark:text-gray-400">
                Yes, we offer a 14-day free trial for the Basic and Pro plans.
                No credit card is required to start the trial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full overflow-hidden bg-primary py-20 px-5 text-center lg:px-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative mx-auto max-w-3xl flex flex-col items-center gap-6">
          <h2 className="text-3xl font-black text-white md:text-5xl">
            Still have questions?
          </h2>
          <p className="max-w-xl text-lg text-blue-100">
            Our sales team is happy to help you find the perfect plan for your
            needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
            <button className="flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-bold text-primary shadow-lg transition-transform hover:scale-105 hover:bg-gray-50">
              Chat with Sales
            </button>
            <button className="flex h-12 items-center justify-center rounded-lg border border-white/30 bg-primary/20 px-8 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-primary/40">
              Visit Help Center
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

export default Pricing;
