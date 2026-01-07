import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import authService from '../../services/authService';
import activityService from '../../services/activityService';

const MyActivity = () => {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ completedToday: 0, thisWeek: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityService.getMyActivity({ filter, limit: 50 });
      const activitiesData = response.activities || [];
      const statsData = response.stats || { completedToday: 0, thisWeek: 0, thisMonth: 0 };
      
      setActivities(activitiesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
      setStats({ completedToday: 0, thisWeek: 0, thisMonth: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      INWARD: 'move_to_inbox',
      OUTWARD: 'outbox',
      TRANSFER_IN: 'login',
      TRANSFER_OUT: 'logout',
      ADJUSTMENT: 'tune',
      PO: 'receipt_long',
      ORDER: 'shopping_cart',
      TRANSFER: 'swap_horiz',
      PR: 'assignment'
    };
    return icons[type] || 'history';
  };

  const getActivityColor = (type) => {
    const colors = {
      INWARD: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      OUTWARD: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      TRANSFER_IN: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      TRANSFER_OUT: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      ADJUSTMENT: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  };

  const getMovementLabel = (type) => {
    const labels = {
      INWARD: 'Stock Received',
      OUTWARD: 'Stock Dispatched',
      TRANSFER_IN: 'Transfer Received',
      TRANSFER_OUT: 'Transfer Sent',
      ADJUSTMENT: 'Stock Adjusted'
    };
    return labels[type] || type;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor((now - date) / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Activity</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your warehouse operations and tasks</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user?.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user?.role?.replace('_', ' ')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            {['all', 'today', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setFilter(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === period
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-gray-400 text-3xl">history</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No activities found for this period</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activities.map((activity) => (
                <div key={activity._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.movementType)}`}>
                      <span className="material-symbols-outlined text-xl">
                        {getActivityIcon(activity.movementType)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                            {getMovementLabel(activity.movementType)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.reference?.number} • {activity.sku?.skuCode}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          activity.movementType.includes('INWARD') || activity.movementType.includes('IN') 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {activity.movementType === 'INWARD' || activity.movementType === 'TRANSFER_IN' ? '+' : '-'}{activity.quantity} units
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {activity.sku?.name} • {activity.warehouse?.name}
                        {activity.batchNumber && <span className="ml-2 font-mono text-xs bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">Batch: {activity.batchNumber}</span>}
                      </p>
                      {activity.remarks && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                          {activity.remarks}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatTimestamp(activity.transactionDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 w-12 h-12 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.completedToday}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 w-12 h-12 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.thisWeek}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 w-12 h-12 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.thisMonth}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyActivity;
