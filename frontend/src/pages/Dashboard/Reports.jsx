import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const Reports = () => {
  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-[#0d121b] dark:text-white mb-2">
            Reports & Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Comprehensive analytics and reports for your inventory
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Inventory Valuation Report', desc: 'Total value of current inventory', icon: 'paid' },
            { title: 'Stock Movement Report', desc: 'Track all inventory transactions', icon: 'sync_alt' },
            { title: 'Low Stock Report', desc: 'Items below reorder point', icon: 'warning' },
            { title: 'Supplier Performance', desc: 'Delivery times and accuracy', icon: 'local_shipping' },
            { title: 'Sales Analysis', desc: 'Best and worst performing items', icon: 'trending_up' },
            { title: 'Aging Report', desc: 'Slow-moving inventory analysis', icon: 'schedule' }
          ].map((report, index) => (
            <div key={index} className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    {report.icon}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-primary">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2">
                {report.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {report.desc}
              </p>
              <button className="text-sm font-medium text-primary hover:underline">
                Generate Report →
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
