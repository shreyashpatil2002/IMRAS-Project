import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('30 Days');

  const stats = [
    {
      title: 'Total Inventory Value',
      value: '$1,240,500',
      icon: 'paid',
      color: 'blue',
      trend: '+2.5%',
      trendUp: true
    },
    {
      title: 'Low Stock Items',
      value: '14 Items',
      icon: 'warning',
      color: 'red',
      badge: 'Action Needed',
      badgeColor: 'red'
    },
    {
      title: 'Pending Reorders',
      value: '8 Orders',
      icon: 'local_shipping',
      color: 'purple',
      badge: 'Same as yesterday',
      badgeColor: 'gray'
    },
    {
      title: 'Monthly Turnover Rate',
      value: '12%',
      icon: 'sync_alt',
      color: 'orange',
      trend: '-1.2%',
      trendUp: false
    }
  ];

  const reorderSuggestions = [
    {
      name: 'Wireless Controller V2',
      sku: 'WC-002-BL',
      currentLevel: 12,
      status: 'Critical',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjsb5j-1dBArRvIDF1QwpJ6ltXTwRnnoMTiC7M-Q0Ojmq1yN1uivi52tRjIthXjfDtB5bzt9dqu9JbIQFGU71v3LAmGBJoR2jTO1q0gT87Z0kUO7ZqEC4aUiVtADnB5-kWIgSE8vLbJoQc9Zhc4vduP9is9wYA2DzAZuT5rmGdjOeBaKXs20juMg09oVOEYtW7IPcTXQEOvudDqhzwg7Ny0CcXI5USi4iXh4SLfjZIuFz1gC_X1ac8FekHkppmbpRfRPqhmeAngw'
    },
    {
      name: 'HDMI Cable 5m',
      sku: 'CB-HDMI-50',
      currentLevel: 8,
      status: 'Critical',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvkdGeSOxGUaxsOUm9RIcg0XI38ZaYEbCorN5why92-feowISFLOzmPpKFBfSUsNMhKbyT1EbgKzO8UOKquknXtz3jeUAPf-arSNmdN45QJHfT6EKkBKDulHPkzP7TlDNzKv0oAIBlHKrvjRp9XQ8SJu3Ur10vfdHpMa1JeGDJH1ZCWLAovD6oadX_1sed8zTvOjzUEukLYy-7DPEDmA7vfw-osYvvJyUSj-2cTUaUF6GehmLHiZdMNy1_W8sWZtnNo464Mv9jdA'
    },
    {
      name: 'Mech Keyboard MK1',
      sku: 'MK-001-RGB',
      currentLevel: 24,
      status: 'Low Stock',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmY3L8H7etoYsnIIQUO6I3dl-E8_ZQDGfNyjl1Wj8kfdLNezpix0muM5S7hh_kpMyLJ9dWp9oOoIrGxjBU1Z0vrfoH1nxQj-zeWZDccLqi9u11Vd_EljTweNiaDcELvsqOhZaowZJ9WR1wEBjiNY7pKqeg8Vi1gvNFkmFCgYyX9GD-T-Xh8T33STzdL70kepfhl3QwyfUHXzNAknj16dRsryfgHH4qr1_aZkfNQ135JP-bpCCSYAGYaSUFPUU96x5sphsofkrh4A'
    },
    {
      name: 'Gaming Mouse X7',
      sku: 'GM-X7-PRO',
      currentLevel: 31,
      status: 'Low Stock',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCciwpgXkVQhTmdbQkSJ9TbwlxfxQFM0y1kD0qjOXoPBts5sDCAn7Avd1lCzTUs5Un7BznW016tEwODE20YefOklbDzICLKHzWSDq0H8LW3PImNBxzO0U4mejf42hkbHAP7qTI0n6apBLR3DAf7YcHmCiwZOG0ZdSCZekbqjhJHpQ7n2Ubhn8rH_3jUs-NKOkqr9nPhAAO4DZNLGl7U0GIneTpRVRP201DsbEAJGTiWoSUdx7avBQOCu0CDimdlEKHUaDdmiUHdTA'
    }
  ];

  const stockMovements = [
    { type: 'received', title: 'Stock Received: #PO-8821', description: 'Received 500 units of USB-C Cables', time: '2m ago', icon: 'arrow_downward', color: 'green' },
    { type: 'dispatched', title: 'Order Dispatched: #ORD-4501', description: 'Packed by Warehouse A', time: '15m ago', icon: 'arrow_upward', color: 'blue' },
    { type: 'adjusted', title: 'Stock Adjusted', description: '-2 units (Damaged) WC-002-BL', time: '1h ago', icon: 'edit', color: 'orange' },
    { type: 'reorder', title: 'Reorder Approved', description: 'Supplier: TechGiant Corp', time: '3h ago', icon: 'local_shipping', color: 'purple' },
    { type: 'dispatched', title: 'Order Dispatched: #ORD-4499', description: 'Packed by Warehouse B', time: '4h ago', icon: 'arrow_upward', color: 'blue' }
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between group hover:border-${stat.color === 'red' ? 'red-500' : 'primary'}/50 transition-all`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`bg-${stat.color}-50 dark:bg-${stat.color}-900/20 p-2 rounded-lg text-${stat.color}-600`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                {stat.trend && (
                  <span className={`text-xs font-semibold ${stat.trendUp ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'} px-2 py-1 rounded-full flex items-center gap-1`}>
                    <span className="material-symbols-outlined text-xs">
                      {stat.trendUp ? 'trending_up' : 'trending_down'}
                    </span>
                    {stat.trend}
                  </span>
                )}
                {stat.badge && (
                  <span className={`text-xs font-semibold ${stat.badgeColor === 'red' ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 bg-gray-100 dark:bg-gray-800'} px-2 py-1 rounded-full`}>
                    {stat.badge}
                  </span>
                )}
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                  {stat.title}
                </p>
                <h3 className={`text-2xl font-bold tracking-tight ${stat.color === 'red' ? 'text-red-600' : ''}`}>
                  {stat.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory Health Chart */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">
                Inventory Health
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Inventory Level vs Demand (Last 30 Days)
              </p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {['30 Days', '90 Days', 'YTD'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    timeRange === range
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[250px] w-full">
            <svg
              className="w-full h-full text-primary"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 1200 250"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint0_linear"
                  x1="600"
                  x2="600"
                  y1="0"
                  y2="250"
                >
                  <stop stopColor="currentColor" stopOpacity="0.1"></stop>
                  <stop offset="1" stopColor="currentColor" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path
                d="M0,200 C150,200 150,50 300,50 C450,50 450,150 600,150 C750,150 750,100 900,100 C1050,100 1050,180 1200,180 V250 H0 Z"
                fill="url(#paint0_linear)"
              ></path>
              <path
                d="M0,200 C150,200 150,50 300,50 C450,50 450,150 600,150 C750,150 750,100 900,100 C1050,100 1050,180 1200,180"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
              ></path>
              <path
                d="M0,180 C150,180 150,80 300,80 C450,80 450,120 600,120 C750,120 750,60 900,60 C1050,60 1050,140 1200,140"
                stroke="#9ca3af"
                strokeDasharray="8 8"
                strokeLinecap="round"
                strokeWidth="2"
              ></path>
            </svg>
          </div>
          <div className="flex justify-between mt-4 border-t border-gray-100 dark:border-gray-800 pt-2 text-xs text-gray-400 font-bold uppercase tracking-wide">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        {/* Reorder Suggestions & Stock Movements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Urgent Reorder Suggestions Table */}
          <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">Urgent Reorder Suggestions</h3>
              <button className="text-sm text-primary font-bold hover:underline">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Product Name</th>
                    <th className="px-5 py-3">SKU</th>
                    <th className="px-5 py-3 text-center">Current Lvl</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {reorderSuggestions.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-5 py-4 font-medium">
                        <span>{product.name}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 font-mono">
                        {product.sku}
                      </td>
                      <td className="px-5 py-4 text-center font-bold">{product.currentLevel}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'Critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className={`font-bold text-xs px-3 py-1.5 rounded border transition-colors ${
                          product.status === 'Critical'
                            ? 'text-primary hover:text-primary-hover bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-900'
                            : 'text-gray-500 hover:text-primary'
                        }`}>
                          {product.status === 'Critical' ? 'Reorder Now' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Stock Movements */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col h-full">
            <h3 className="text-lg font-bold mb-4">Recent Stock Movements</h3>
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-2">
              {stockMovements.map((movement, index) => (
                <div key={index} className="flex gap-3 items-start pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <div className={`size-10 rounded-full bg-${movement.color}-100 dark:bg-${movement.color}-900/20 text-${movement.color}-600 flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-sm font-bold">
                      {movement.icon}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{movement.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{movement.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{movement.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
