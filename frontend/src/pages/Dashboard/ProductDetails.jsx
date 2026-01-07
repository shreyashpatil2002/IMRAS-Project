import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const ProductDetails = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 Days');

  const batches = [
    { id: 'B-2023-OCT-001', date: 'Oct 12, 2023', location: 'Zone A, Shelf 4', quantity: 120 },
    { id: 'B-2023-NOV-015', date: 'Nov 05, 2023', location: 'Zone A, Shelf 5', quantity: 330 }
  ];

  const stockMovements = [
    { date: 'Nov 05, 2023', type: 'Received', reference: 'PO-9921', user: 'S. Johnson', change: +330, balance: 450, color: 'green' },
    { date: 'Nov 03, 2023', type: 'Shipped', reference: 'ORD-5542', user: 'A. Morgan', change: -20, balance: 120, color: 'blue' },
    { date: 'Nov 01, 2023', type: 'Adjust', reference: 'Audit-Q4', user: 'J. Smith', change: -5, balance: 140, color: 'orange' },
    { date: 'Oct 28, 2023', type: 'Shipped', reference: 'ORD-5501', user: 'A. Morgan', change: -55, balance: 145, color: 'blue' }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Received': return 'arrow_downward';
      case 'Shipped': return 'arrow_upward';
      case 'Adjust': return 'edit';
      default: return 'swap_horiz';
    }
  };

  const getTypeColor = (color) => {
    switch (color) {
      case 'green': return 'text-green-600 dark:text-green-400';
      case 'blue': return 'text-blue-600 dark:text-blue-400';
      case 'orange': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <DashboardLayout title="Product Details">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <a href="/dashboard/inventory" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Inventory List
              </a>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0d121b] dark:text-white">
                Pro Wireless Mouse M350
              </h1>
              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                In Stock
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: Today at 09:42 AM
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              Related Orders
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Product
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">swap_vert</span>
              Adjust Stock
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image, Supplier, Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Image */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative group">
                <span className="material-symbols-outlined text-[96px] text-gray-300 dark:text-gray-600">mouse</span>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white/90 text-gray-900 p-2 rounded-full shadow-sm hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </button>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stock</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">450</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Reorder Point: 50</span>
                  <span>Max Capacity: 600</span>
                </div>
              </div>
            </div>

            {/* Supplier */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">local_shipping</span>
                  Supplier
                </h3>
                <a href="#" className="text-xs text-primary hover:underline">View Profile</a>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                  AE
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Acme Electronics</p>
                  <p className="text-xs text-gray-500">ID: SUP-2023-001</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  <a href="mailto:orders@acme.com" className="hover:text-primary transition-colors">orders@acme.com</a>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Create Purchase Order
              </button>
            </div>

            {/* Configuration */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-md font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">settings</span>
                Configuration
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-gray-500">qr_code</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Batch Tracking</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-green-500">check_circle</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-gray-500">calendar_month</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Expiry Tracking</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-gray-300 dark:text-gray-600">cancel</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-gray-500">tag</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Serial Numbers</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-gray-300 dark:text-gray-600">cancel</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats, Info, Batches, Movement */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Unit Cost</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">12.50</p>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Selling Price</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">24.99</p>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Value</p>
                <p className="text-xl font-bold text-primary">11,245.50</p>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Margin</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">49.9%</p>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400">info</span>
                Product Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">SKU</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-800 inline-block px-2 py-0.5 rounded">
                    WM-350-BLK
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                      Electronics
                    </span>
                    <span className="px-2 py-0.5 rounded text-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 font-medium">
                      Peripherals
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</p>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  High-precision wireless optical mouse featuring ergonomic design, silent clicking mechanism, and long battery life
                  (up to 18 months). Includes nano receiver and supports both Bluetooth and 2.4GHz connections. Compatible with
                  Windows, macOS, and Linux.
                </p>
              </div>
            </div>

            {/* Active Batches */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400">layers</span>
                  Active Batches
                </h3>
                <button className="text-primary text-sm font-medium hover:underline">
                  View All Batches
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 font-medium">Batch #</th>
                      <th className="px-6 py-3 font-medium">Received Date</th>
                      <th className="px-6 py-3 font-medium">Location</th>
                      <th className="px-6 py-3 font-medium text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {batches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{batch.id}</td>
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{batch.date}</td>
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{batch.location}</td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900 dark:text-white">{batch.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock Movement */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400">history</span>
                  Stock Movement
                </h3>
                <div className="flex gap-2">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="text-xs border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-600 dark:text-gray-300"
                  >
                    <option>Last 30 Days</option>
                    <option>Last 3 Months</option>
                    <option>Last Year</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Type</th>
                      <th className="px-6 py-3 font-medium">Reference</th>
                      <th className="px-6 py-3 font-medium">User</th>
                      <th className="px-6 py-3 font-medium text-right">Change</th>
                      <th className="px-6 py-3 font-medium text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {stockMovements.map((movement, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{movement.date}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 ${getTypeColor(movement.color)} text-xs font-bold uppercase`}>
                            <span className="material-symbols-outlined text-[14px]">{getTypeIcon(movement.type)}</span>
                            {movement.type}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {movement.reference.startsWith('PO-') || movement.reference.startsWith('ORD-') ? (
                            <span className="text-primary hover:underline cursor-pointer">{movement.reference}</span>
                          ) : (
                            <span className="text-gray-500">{movement.reference}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{movement.user}</td>
                        <td className={`px-6 py-3 text-right font-medium ${movement.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                          {movement.change > 0 ? '+' : ''}{movement.change}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-300">{movement.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
                <button className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                  Load older records
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetails;
