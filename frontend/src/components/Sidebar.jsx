import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { getMenuForRole } from '../config/menuConfig';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState({ sections: [] });
  
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser && currentUser.role) {
      const menu = getMenuForRole(currentUser.role);
      setMenuItems(menu);
    }
  }, []);
  
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
          {menuItems.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="flex flex-col gap-1">
              {section.title && (
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </p>
              )}
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                    isActive(item.path)
                      ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${
                    !isActive(item.path) ? 'text-gray-500 dark:text-gray-400 group-hover:text-primary' : ''
                  }`}>
                    {item.icon}
                  </span>
                  <p className="text-sm font-medium">{item.label}</p>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-[#e7ebf3] dark:border-gray-800">
        <div className="flex flex-col gap-1">
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
