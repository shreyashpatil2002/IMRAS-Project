import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    companyName: 'IMRAS',
    email: 'admin@imras.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Street, Suite 400',
    timezone: 'UTC-5',
    currency: 'USD',
    language: 'en',
    lowStockThreshold: '20',
    criticalStockLevel: '10',
    emailNotifications: true,
    stockAlerts: true,
    orderUpdates: true,
    weeklyReports: false,
    darkMode: false,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security', icon: 'lock' },
    { id: 'backup', label: 'Backup & Data', icon: 'backup' }
  ];

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0d121b] dark:text-white">
              Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your account and system preferences
            </p>
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-2">
              <nav className="flex flex-col gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {tab.icon}
                    </span>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <form onSubmit={handleSubmit}>
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
                      General Settings
                    </h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Company Name
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Timezone
                          </label>
                          <select
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="UTC-8">Pacific Time (UTC-8)</option>
                            <option value="UTC-7">Mountain Time (UTC-7)</option>
                            <option value="UTC-6">Central Time (UTC-6)</option>
                            <option value="UTC-5">Eastern Time (UTC-5)</option>
                            <option value="UTC+0">UTC+0</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Currency
                          </label>
                          <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="USD">$ - USD - US Dollar</option>
                            <option value="EUR">€ - EUR - Euro</option>
                            <option value="GBP">£ - GBP - British Pound</option>
                            <option value="INR">₹ - INR - Indian Rupee</option>
                            <option value="JPY">¥ - JPY - Japanese Yen</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Language
                          </label>
                          <select
                            name="language"
                            value={formData.language}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inventory Settings */}
                {activeTab === 'inventory' && (
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
                      Inventory Management Settings
                    </h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Low Stock Threshold
                          </label>
                          <input
                            type="number"
                            name="lowStockThreshold"
                            value={formData.lowStockThreshold}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Alert when stock falls below this level
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Critical Stock Level
                          </label>
                          <input
                            type="number"
                            name="criticalStockLevel"
                            value={formData.criticalStockLevel}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Urgent alert when stock is critically low
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex gap-3">
                          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                            info
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
                              Stock Level Guidelines
                            </h4>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              Critical level should always be lower than low stock threshold. These values help automate reorder suggestions and inventory alerts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
                      Notification Preferences
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-gray-500">mail</span>
                          <div>
                            <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                              Email Notifications
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Receive general updates via email
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={formData.emailNotifications}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-gray-500">inventory</span>
                          <div>
                            <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                              Stock Alerts
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Get notified about low stock levels
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="stockAlerts"
                            checked={formData.stockAlerts}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-gray-500">shopping_cart</span>
                          <div>
                            <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                              Order Updates
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Notifications for order status changes
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="orderUpdates"
                            checked={formData.orderUpdates}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-gray-500">bar_chart</span>
                          <div>
                            <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                              Weekly Reports
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Receive weekly inventory reports
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="weeklyReports"
                            checked={formData.weeklyReports}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
                      Security Settings
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Change Password
                        </h3>
                        <div className="space-y-4">
                          <input
                            type="password"
                            placeholder="Current Password"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <input
                            type="password"
                            placeholder="New Password"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <input
                            type="password"
                            placeholder="Confirm New Password"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <button
                            type="button"
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors"
                          >
                            Update Password
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Two-Factor Authentication
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                                2FA Status: <span className="text-red-600">Disabled</span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              Enable 2FA
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Backup Settings */}
                {activeTab === 'backup' && (
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
                      Backup & Data Management
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-gray-500">backup</span>
                          <div>
                            <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                              Automatic Backup
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Automatically backup your data
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="autoBackup"
                            checked={formData.autoBackup}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Backup Frequency
                        </label>
                        <select
                          name="backupFrequency"
                          value={formData.backupFrequency}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="hourly">Every Hour</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                            check_circle
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-green-900 dark:text-green-300 mb-1">
                              Last Backup
                            </h4>
                            <p className="text-xs text-green-700 dark:text-green-400">
                              Successfully completed on Dec 13, 2025 at 2:30 AM
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                          Download Backup
                        </button>
                        <button
                          type="button"
                          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">backup</span>
                          Backup Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
