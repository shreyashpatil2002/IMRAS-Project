import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import skuService from '../../services/skuService';
import warehouseService from '../../services/warehouseService';
import stockLedgerService from '../../services/stockLedgerService';
import authService from '../../services/authService';

const InventoryList = () => {
  const [transactions, setTransactions] = useState([]);
  const [skus, setSKUs] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTransactionType, setFilterTransactionType] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterReferenceType, setFilterReferenceType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const transactionTypes = ['INWARD', 'OUTWARD', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'];
  const referenceTypes = ['PO', 'SALE', 'TRANSFER', 'ADJUSTMENT', 'ORDER'];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    // Auto-select warehouse for non-admin users
    if (currentUser?.role !== 'ADMIN' && currentUser?.assignedWarehouse) {
      setFilterWarehouse(currentUser.assignedWarehouse);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [filterTransactionType, filterWarehouse, filterReferenceType, dateFrom, dateTo, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Build query params
      const params = {};
      if (filterTransactionType) params.movementType = filterTransactionType;
      if (filterWarehouse) params.warehouse = filterWarehouse;
      if (filterReferenceType) params.referenceType = filterReferenceType;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      params.limit = 200; // Fetch more records

      console.log('Fetching stock ledger with params:', params);

      // Fetch stock ledger transactions, SKUs, and warehouses
      const [transactionsRes, skusRes, warehousesRes] = await Promise.all([
        stockLedgerService.getAllTransactions(params),
        skuService.getAllSKUs(),
        warehouseService.getAllWarehouses()
      ]);

      console.log('Transactions response:', transactionsRes);
      console.log('SKUs response:', skusRes);
      console.log('Warehouses response:', warehousesRes);

      // Handle response structure
      const transactionsList = transactionsRes.data?.transactions || transactionsRes.transactions || [];
      const skusList = skusRes.data?.skus || skusRes.skus || [];
      const warehousesList = warehousesRes.data?.warehouses || warehousesRes.warehouses || [];

      console.log('Extracted transactions:', transactionsList.length);

      setTransactions(transactionsList);
      setSKUs(skusList);
      setWarehouses(warehousesList);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      fetchData();
      return;
    }

    // Search is done on the frontend for now
    // Could be moved to backend for better performance
    const filtered = transactions.filter(t =>
      t.sku?.skuCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sku?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referenceId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTransactions(filtered);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const getTransactionTypeColor = (type) => {
    const colors = {
      INWARD: 'bg-green-100 text-green-800 border-green-200',
      IN: 'bg-green-100 text-green-800 border-green-200',
      OUTWARD: 'bg-red-100 text-red-800 border-red-200',
      OUT: 'bg-red-100 text-red-800 border-red-200',
      TRANSFER_IN: 'bg-blue-100 text-blue-800 border-blue-200',
      TRANSFER_OUT: 'bg-orange-100 text-orange-800 border-orange-200',
      ADJUSTMENT: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getReferenceTypeIcon = (type) => {
    const icons = {
      GRN: 'inventory',
      PO: 'shopping_cart',
      SALE: 'point_of_sale',
      TRANSFER: 'swap_horiz',
      ADJUSTMENT: 'tune'
    };
    return icons[type] || 'description';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    const datePart = dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timePart = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { date: datePart, time: timePart };
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Stock Transactions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track all inventory movements and transactions</p>
          </div>
          <button
            onClick={() => fetchData()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="SKU, Batch, Reference..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">
                  search
                </span>
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                value={filterTransactionType}
                onChange={(e) => setFilterTransactionType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Types</option>
                {transactionTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Warehouse
              </label>
              <select
                value={filterWarehouse}
                onChange={(e) => setFilterWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Warehouses</option>
                {warehouses.map(wh => (
                  <option key={wh._id} value={wh._id}>{wh.name}</option>
                ))}
              </select>
            </div>

            {/* Reference Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reference Type
              </label>
              <select
                value={filterReferenceType}
                onChange={(e) => setFilterReferenceType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All References</option>
                {referenceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      SKU Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Warehouse & Bin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Batch & Expiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {/* Date & Time */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-gray-400 text-[18px]">
                              schedule
                            </span>
                            <div>
                              <div className="font-medium">{formatDate(transaction.transactionDate).date}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(transaction.transactionDate).time}</div>
                            </div>
                          </div>
                        </td>

                        {/* SKU Details */}
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {transaction.sku?.skuCode}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                            {transaction.sku?.name}
                          </div>
                        </td>

                        {/* Transaction Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTransactionTypeColor(transaction.movementType)}`}>
                            {transaction.movementType}
                          </span>
                        </td>

                        {/* Warehouse & Bin */}
                        <td className="px-6 py-4 text-sm">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {transaction.warehouse?.name}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                            Bin: {transaction.location?.aisle && transaction.location?.bin 
                              ? `${transaction.location.aisle}-${transaction.location.bin}` 
                              : transaction.location || 'N/A'}
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.movementType === 'ADJUSTMENT' ? (
                            <span className={`font-bold ${transaction.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.quantity >= 0 ? '+' : ''}{transaction.quantity}
                            </span>
                          ) : (
                            <span className={`font-bold ${transaction.movementType.includes('IN') || transaction.movementType === 'INWARD' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.movementType.includes('IN') || transaction.movementType === 'INWARD' ? '+' : '-'}
                              {transaction.quantity}
                            </span>
                          )}
                        </td>

                        {/* Batch & Expiry */}
                        <td className="px-6 py-4 text-sm">
                          <div className="text-gray-900 dark:text-white">
                            {transaction.batchNumber}
                          </div>
                          {transaction.expiryDate && (
                            <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                              Exp: {new Date(transaction.expiryDate).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </td>

                        {/* Reference */}
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">
                              {getReferenceTypeIcon(transaction.referenceType)}
                            </span>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {transaction.referenceType}
                              </div>
                              <div className="text-gray-900 dark:text-white font-medium">
                                {transaction.reference?.number || transaction.referenceId?.toString().substring(0, 8) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewDetails(transaction)}
                            className="text-primary hover:text-blue-700 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Transaction Details
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Transaction Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Transaction ID
                      </label>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {selectedTransaction._id}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Transaction Type
                      </label>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getTransactionTypeColor(selectedTransaction.movementType)}`}>
                        {selectedTransaction.movementType}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        SKU Code
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedTransaction.sku?.skuCode}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Product Name
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedTransaction.sku?.name}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Warehouse
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedTransaction.warehouse?.name} ({selectedTransaction.warehouse?.code})
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Bin Location
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedTransaction.location?.aisle && selectedTransaction.location?.bin 
                          ? `${selectedTransaction.location.aisle}-${selectedTransaction.location.bin}` 
                          : selectedTransaction.location || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Quantity
                      </label>
                      {selectedTransaction.movementType === 'ADJUSTMENT' ? (
                        <p className={`text-sm font-bold ${selectedTransaction.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedTransaction.quantity >= 0 ? '+' : ''}{selectedTransaction.quantity}
                        </p>
                      ) : (
                        <p className={`text-sm font-bold ${selectedTransaction.movementType.includes('IN') || selectedTransaction.movementType === 'INWARD' ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedTransaction.movementType.includes('IN') || selectedTransaction.movementType === 'INWARD' ? '+' : '-'}
                          {selectedTransaction.quantity}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Balance After Transaction
                      </label>
                      <p className="text-sm font-bold text-blue-600">
                        {selectedTransaction.balanceQuantity}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Batch Number
                      </label>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {selectedTransaction.batchNumber || 'N/A'}
                      </p>
                    </div>

                    {selectedTransaction.expiryDate && (
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                          Expiry Date
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedTransaction.expiryDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Reference Type
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedTransaction.referenceType}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Reference Number
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedTransaction.reference?.number || selectedTransaction.referenceId?.toString().substring(0, 8) || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Created By
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedTransaction.user?.name || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Transaction Date
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedTransaction.transactionDate).date}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(selectedTransaction.transactionDate).time}
                      </p>
                    </div>

                    {selectedTransaction.remarks && (
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                          Remarks
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedTransaction.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InventoryList;
