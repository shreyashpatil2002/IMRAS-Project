import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import reportService from '../../services/reportService';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);

  const reports = [
    { id: 'reorder', title: 'Reorder Suggestions', desc: 'SKUs that need restocking', icon: 'notification_important', color: 'orange' },
    { id: 'abc', title: 'ABC Analysis', desc: 'Categorize inventory by value', icon: 'category', color: 'blue' },
    { id: 'ageing', title: 'Stock Ageing Report', desc: 'Track expiry dates and aging', icon: 'schedule', color: 'yellow' },
    { id: 'turnover', title: 'Inventory Turnover', desc: 'Stock rotation efficiency', icon: 'sync_alt', color: 'green' },
    { id: 'stock-value', title: 'Stock Valuation', desc: 'Current inventory value', icon: 'paid', color: 'purple' },
    { id: 'supplier', title: 'Supplier Performance', desc: 'Delivery and quality metrics', icon: 'local_shipping', color: 'indigo' },
    { id: 'fulfillment', title: 'Order Fulfillment', desc: 'Order completion statistics', icon: 'trending_up', color: 'green' }
  ];

  const generateReport = async (reportId) => {
    try {
      setLoading(true);
      setActiveReport(reportId);
      let data;
      
      switch(reportId) {
        case 'reorder':
          data = await reportService.getReorderSuggestions();
          break;
        case 'abc':
          data = await reportService.getABCAnalysis();
          break;
        case 'ageing':
          data = await reportService.getStockAgeingReport();
          break;
        case 'turnover':
          data = await reportService.getTurnoverRatio();
          break;
        case 'stock-value':
          data = await reportService.getStockValueReport();
          break;
        case 'supplier':
          data = await reportService.getSupplierPerformance();
          break;
        case 'fulfillment':
          data = await reportService.getOrderFulfillmentReport();
          break;
        default:
          data = null;
      }
      
      setReportData(data.data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (color) => {
    const colors = {
      orange: 'bg-orange-100 text-orange-600',
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive analytics for your inventory</p>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => generateReport(report.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClass(report.color)}`}>
                  <span className="material-symbols-outlined text-[24px]">
                    {report.icon}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-primary">
                  <span className="material-symbols-outlined">description</span>
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                {report.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {report.desc}
              </p>
              <button className="text-sm font-medium text-primary hover:underline">
                Generate Report →
              </button>
            </div>
          ))}
        </div>

        {/* Report Display Area */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Generating report...</p>
          </div>
        )}

        {!loading && reportData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {reports.find(r => r.id === activeReport)?.title}
              </h2>
              <button
                onClick={() => { setActiveReport(null); setReportData(null); }}
                className="text-gray-600 hover:text-gray-800"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Display report data based on type */}
            <div className="overflow-x-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
