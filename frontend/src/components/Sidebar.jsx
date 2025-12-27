import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#e7ebf3] dark:border-gray-800 bg-surface-light dark:bg-surface-dark flex flex-col h-full transition-all">
      <div className="p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-primary/10 flex items-center justify-center aspect-square rounded-full size-10 text-primary">
            <span className="material-symbols-outlined text-2xl">inventory_2</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none tracking-tight">
              IMRAS
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
              Inventory Manager
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        <nav className="flex flex-col gap-6">
          {/* Dashboard */}
          <div>
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive('/dashboard')
                  ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform ${
                !isActive('/dashboard') && 'text-gray-500 dark:text-gray-400 group-hover:text-primary'
              }`}>
                dashboard
              </span>
              <p className="text-sm font-medium">Dashboard</p>
            </Link>
          </div>

          {/* Warehouse Products */}
          <div className="flex flex-col gap-1">
            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Warehouse Products
            </p>
            <Link
              to="/dashboard/inventory"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard/inventory')
                  ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${
                !isActive('/dashboard/inventory') ? 'text-gray-500 dark:text-gray-400 group-hover:text-primary' : ''
              }`}>
                format_list_bulleted
              </span>
              <p className="text-sm font-medium">Inventory List</p>
            </Link>
            <Link
              to="/dashboard/batch-tracking"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard/batch-tracking')
                  ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${
                !isActive('/dashboard/batch-tracking') ? 'text-gray-500 dark:text-gray-400 group-hover:text-primary' : ''
              }`}>
                qr_code_2
              </span>
              <p className="text-sm font-medium">Batch/Lot Tracking</p>
            </Link>
            <Link
              to="/dashboard/add-product"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard/add-product')
                  ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${
                !isActive('/dashboard/add-product') ? 'text-gray-500 dark:text-gray-400 group-hover:text-primary' : ''
              }`}>
                add_circle
              </span>
              <p className="text-sm font-medium">Add New Product</p>
            </Link>
          </div>

          {/* Operations */}
          <div className="flex flex-col gap-1">
            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Operations
            </p>
            <Link
              to="/dashboard/orders"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard/orders')
                  ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${
                !isActive('/dashboard/orders') ? 'text-gray-500 dark:text-gray-400 group-hover:text-primary' : ''
              }`}>
                shopping_cart
              </span>
              <p className="text-sm font-medium">Orders</p>
              <span className="ml-auto bg-blue-100 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                3
              </span>
            </Link>
            <Link
              to="/dashboard/suppliers"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard/suppliers')
                  ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${
                !isActive('/dashboard/suppliers') ? 'text-gray-500 dark:text-gray-400 group-hover:text-primary' : ''
              }`}>
                storefront
              </span>
              <p className="text-sm font-medium">Suppliers</p>
            </Link>
          </div>

          {/* Administration */}
          <div className="flex flex-col gap-1">
            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Administration
            </p>
            <Link
              to="/dashboard/users"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard/users')
                  ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${
                !isActive('/dashboard/users') ? 'text-gray-500 dark:text-gray-400 group-hover:text-primary' : ''
              }`}>
                manage_accounts
              </span>
              <p className="text-sm font-medium">User Management</p>
            </Link>
            <Link
              to="/dashboard/reports"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard/reports')
                  ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${
                !isActive('/dashboard/reports') ? 'text-gray-500 dark:text-gray-400 group-hover:text-primary' : ''
              }`}>
                bar_chart
              </span>
              <p className="text-sm font-medium">Reports</p>
            </Link>
          </div>
        </nav>
      </div>
      
      <div className="p-4 border-t border-[#e7ebf3] dark:border-gray-800">
        <div className="flex flex-col gap-1">
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px] text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
              settings
            </span>
            <p className="text-sm font-medium">Settings</p>
          </Link>
          <Link
            to="/dashboard/help"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px] text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
              help
            </span>
            <p className="text-sm font-medium">Help &amp; Support</p>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group w-full"
          >
            <span className="material-symbols-outlined text-[20px] text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400">
              logout
            </span>
            <p className="text-sm font-medium">Logout</p>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
