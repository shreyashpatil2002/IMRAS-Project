import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import poService from '../../services/poService';
import authService from '../../services/authService';

const PurchaseOrders = () => {
  const [pos, setPOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [user, setUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingPoId, setLoadingPoId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const res = await poService.getAllPOs(params);
      
      const posData = res.data?.pos || res.pos || [];
      
      setPOs(Array.isArray(posData) ? posData : []);
    } catch (error) {
      console.error('Error fetching POs:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (actionLoading) return;
    
    try {
      if (action === 'cancel') {
        const reason = prompt('Please provide cancellation reason:');
        if (!reason) return;
      }
      
      setActionLoading(true);
      setLoadingPoId(id);
      setLoadingAction(action);
      
      if (action === 'approve') {
        await poService.approvePO(id);
        alert('PO approved!');
      } else if (action === 'send') {
        await poService.sendPO(id);
        alert('PO sent to supplier!');
      } else if (action === 'close') {
        await poService.closePO(id);
        alert('PO closed!');
      } else if (action === 'cancel') {
        const reason = prompt('Please provide cancellation reason:');
        if (reason) {
          await poService.cancelPO(id, reason);
          alert('PO cancelled!');
        }
      }
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
      setLoadingPoId(null);
      setLoadingAction(null);
    }
  };

  const handleViewPO = async (id) => {
    try {
      const res = await poService.getPO(id);
      setSelectedPO(res.data?.po || res.po);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching PO:', error);
      alert('Failed to load PO details');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: 'bg-gray-100 text-gray-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      SENT: 'bg-yellow-100 text-yellow-800',
      PARTIALLY_RECEIVED: 'bg-orange-100 text-orange-800',
      RECEIVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canApprove = (po) => po.status === 'CREATED' && user?.role === 'ADMIN';
  const canSend = (po) => po.status === 'APPROVED' && (user?.role === 'ADMIN' || user?.role === 'INVENTORY_MANAGER');
  const canClose = (po) => po.status === 'RECEIVED' && (user?.role === 'ADMIN' || user?.role === 'INVENTORY_MANAGER');
  const canCancel = (po) => !['RECEIVED', 'CLOSED', 'CANCELLED'].includes(po.status) && user?.role === 'ADMIN';

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Purchase Orders</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage purchase orders</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="CREATED">Created</option>
            <option value="APPROVED">Approved</option>
            <option value="SENT">Sent</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="RECEIVED">Received</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* PO Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">PO Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No POs found</td>
                  </tr>
                ) : (
                  pos.map((po) => (
                    <tr key={po._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{po.poNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{po.supplier?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{po.warehouse?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${po.totalAmount?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button 
                          onClick={() => handleViewPO(po._id)} 
                          disabled={actionLoading}
                          className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          View
                        </button>
                        {canApprove(po) && (
                          <button 
                            onClick={() => handleAction(po._id, 'approve')} 
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                          >
                            {loadingPoId === po._id && loadingAction === 'approve' && (
                              <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            Approve
                          </button>
                        )}
                        {canSend(po) && (
                          <button 
                            onClick={() => handleAction(po._id, 'send')} 
                            disabled={actionLoading}
                            className="text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                          >
                            {loadingPoId === po._id && loadingAction === 'send' && (
                              <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            Send
                          </button>
                        )}
                        {canClose(po) && (
                          <button 
                            onClick={() => handleAction(po._id, 'close')} 
                            disabled={actionLoading}
                            className="text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                          >
                            {loadingPoId === po._id && loadingAction === 'close' && (
                              <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            Close
                          </button>
                        )}
                        {canCancel(po) && (
                          <button 
                            onClick={() => handleAction(po._id, 'cancel')} 
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                          >
                            {loadingPoId === po._id && loadingAction === 'cancel' && (
                              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* View PO Modal */}
        {showViewModal && selectedPO && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Purchase Order Details</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">PO Number: {selectedPO.poNumber}</p>
                  </div>
                  <button
                    onClick={() => { setShowViewModal(false); setSelectedPO(null); }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* PO Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Supplier</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPO.supplier?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPO.supplier?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Warehouse</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPO.warehouse?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPO.warehouse?.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPO.status)}`}>
                      {selectedPO.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expected Delivery</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created By</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPO.createdBy?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Approved By</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPO.approvedBy?.name || 'N/A'}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left">SKU</th>
                          <th className="px-4 py-2 text-left">Item Name</th>
                          <th className="px-4 py-2 text-right">Unit Price</th>
                          <th className="px-4 py-2 text-right">Ordered Qty</th>
                          <th className="px-4 py-2 text-right">Received Qty</th>
                          <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedPO.items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 font-medium">{item.sku?.skuCode || 'N/A'}</td>
                            <td className="px-4 py-2">{item.sku?.name || 'N/A'}</td>
                            <td className="px-4 py-2 text-right">${item.unitPrice?.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">{item.orderedQuantity}</td>
                            <td className="px-4 py-2 text-right text-green-600 font-medium">{item.receivedQuantity || 0}</td>
                            <td className="px-4 py-2 text-right font-medium">${(item.unitPrice * item.orderedQuantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <td colSpan="5" className="px-4 py-2 text-right font-semibold">Total Amount:</td>
                          <td className="px-4 py-2 text-right font-bold text-lg">${selectedPO.totalAmount?.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {canApprove(selectedPO) && (
                    <button
                      onClick={() => { handleAction(selectedPO._id, 'approve'); setShowViewModal(false); }}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loadingPoId === selectedPO._id && loadingAction === 'approve' && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      Approve PO
                    </button>
                  )}
                  {canSend(selectedPO) && (
                    <button
                      onClick={() => { handleAction(selectedPO._id, 'send'); setShowViewModal(false); }}
                      disabled={actionLoading}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loadingPoId === selectedPO._id && loadingAction === 'send' && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      Send to Supplier
                    </button>
                  )}
                  {canClose(selectedPO) && (
                    <button
                      onClick={() => { handleAction(selectedPO._id, 'close'); setShowViewModal(false); }}
                      disabled={actionLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loadingPoId === selectedPO._id && loadingAction === 'close' && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      Close PO
                    </button>
                  )}
                  {canCancel(selectedPO) && (
                    <button
                      onClick={() => { handleAction(selectedPO._id, 'cancel'); setShowViewModal(false); }}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loadingPoId === selectedPO._id && loadingAction === 'cancel' && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      Cancel PO
                    </button>
                  )}
                  <button
                    onClick={() => { setShowViewModal(false); setSelectedPO(null); }}
                    disabled={actionLoading}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PurchaseOrders;
