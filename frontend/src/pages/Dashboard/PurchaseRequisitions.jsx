import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import prService from '../../services/prService';
import skuService from '../../services/skuService';
import warehouseService from '../../services/warehouseService';
import authService from '../../services/authService';

const PurchaseRequisitions = () => {
  const [prs, setPRs] = useState([]);
  const [skus, setSKUs] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPRForView, setSelectedPRForView] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    warehouse: '',
    priority: 'MEDIUM',
    items: [{ sku: '', requestedQuantity: '', urgency: 'MEDIUM', remarks: '' }],
    requiredByDate: ''
  });
  
  const [selectedSKUs, setSelectedSKUs] = useState({});
  const [currentStocks, setCurrentStocks] = useState({});

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchData();
  }, [statusFilter]);

  useEffect(() => {
    // Auto-select warehouse when modal opens for non-admin users
    if (showModal && user) {
      if (user.role !== 'ADMIN' && user.assignedWarehouse) {
        setFormData(prev => ({
          ...prev,
          warehouse: user.assignedWarehouse
        }));
      }
    }
  }, [showModal, user, warehouses]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      console.log('Fetching PRs with params:', params);
      
      const [prsRes, skusRes, warehousesRes] = await Promise.all([
        prService.getAllPRs(params),
        skuService.getAllSKUs(),
        warehouseService.getAllWarehouses()
      ]);
      
      console.log('PRs response:', prsRes);
      console.log('PRs response.data:', prsRes.data);
      console.log('SKUs response:', skusRes);
      console.log('Warehouses response:', warehousesRes);
      
      // Handle different response structures
      const prsData = prsRes.data?.prs || prsRes.prs || prsRes.data || [];
      const skusData = skusRes.skus || skusRes.data?.skus || [];
      const warehousesData = warehousesRes.warehouses || warehousesRes.data?.warehouses || [];
      
      console.log('PRs data extracted:', prsData);
      console.log('PRs data is array?', Array.isArray(prsData));
      console.log('Number of PRs:', Array.isArray(prsData) ? prsData.length : 0);
      
      setPRs(Array.isArray(prsData) ? prsData : []);
      setSKUs(Array.isArray(skusData) ? skusData : []);
      setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
      
      console.log('SKUs loaded:', skusData.length);
      console.log('Warehouses loaded:', warehousesData.length);
      console.log('PRs set to state, count:', Array.isArray(prsData) ? prsData.length : 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    try {
      setSubmitting(true);
      const prData = {
        warehouse: formData.warehouse,
        items: formData.items.map(item => ({
          sku: item.sku,
          requestedQuantity: parseInt(item.requestedQuantity),
          urgency: item.urgency,
          remarks: item.remarks
        })),
        requiredByDate: formData.requiredByDate || undefined
      };
      
      await prService.createPR(prData);
      alert('Purchase Requisition created successfully!');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating PR:', error);
      alert(error.response?.data?.message || 'Failed to create PR');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSKUChange = async (index, skuId) => {
    const newItems = [...formData.items];
    newItems[index].sku = skuId;
    setFormData(prev => ({ ...prev, items: newItems }));
    
    if (skuId && formData.warehouse) {
      try {
        const sku = skus.find(s => s._id === skuId);
        setSelectedSKUs(prev => ({ ...prev, [index]: sku }));
        
        // Fetch current stock for selected warehouse
        const stockData = await skuService.getSKUStock(skuId, formData.warehouse);
        
        // stockData is already the data object: { currentStock: 140, skuCode: ..., ... }
        const currentStock = stockData.currentStock || 0;
        
        setCurrentStocks(prev => ({ ...prev, [index]: currentStock }));
      } catch (error) {
        console.error('Error fetching SKU stock:', error);
        setCurrentStocks(prev => ({ ...prev, [index]: 0 }));
      }
    } else {
      setSelectedSKUs(prev => ({ ...prev, [index]: null }));
      setCurrentStocks(prev => ({ ...prev, [index]: 0 }));
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'view') {
        const prData = await prService.getPR(id);
        setSelectedPRForView(prData.data?.pr || prData.pr);
        setShowViewModal(true);
        return;
      } else if (action === 'submit') {
        await prService.submitPR(id);
        alert('PR submitted successfully!');
      } else if (action === 'approve') {
        await prService.approvePR(id);
        alert('PR approved successfully!');
      } else if (action === 'reject') {
        const reason = prompt('Please provide rejection reason:');
        if (reason && reason.trim()) {
          await prService.rejectPR(id, reason.trim());
          alert('PR rejected!');
        } else if (reason !== null) {
          alert('Rejection reason cannot be empty');
          return;
        } else {
          return; // User clicked Cancel
        }
      } else if (action === 'convert') {
        if (window.confirm('Convert this PR to Purchase Order(s)?')) {
          await prService.convertToPO(id);
          alert('PR converted to PO successfully!');
        }
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this Purchase Requisition? This action cannot be undone.')) {
          await prService.deletePR(id);
          alert('PR deleted successfully!');
          setShowViewModal(false);
        } else {
          return;
        }
      }
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { sku: '', requestedQuantity: '', urgency: 'MEDIUM', remarks: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      alert('At least one item is required');
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
    
    // Clean up selected SKUs and stocks
    const newSelectedSKUs = { ...selectedSKUs };
    const newCurrentStocks = { ...currentStocks };
    delete newSelectedSKUs[index];
    delete newCurrentStocks[index];
    setSelectedSKUs(newSelectedSKUs);
    setCurrentStocks(newCurrentStocks);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const resetForm = () => {
    setFormData({
      warehouse: '',
      priority: 'MEDIUM',
      items: [{ sku: '', requestedQuantity: '', urgency: 'MEDIUM', remarks: '' }],
      requiredByDate: ''
    });
    setSelectedSKUs({});
    setCurrentStocks({});
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CONVERTED_TO_PO: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Check if current user is the creator of the PR
  const isCreator = (pr) => {
    const prCreatorId = pr.requestedBy?._id || pr.requestedBy;
    const userId = user?._id || user?.id;
    const result = String(prCreatorId) === String(userId);
    console.log('isCreator check:', { prCreatorId, userId, result, prStatus: pr.status, userRole: user?.role });
    return result;
  };

  // Everyone can view PRs
  const canView = (pr) => true;
  
  // Only creator manager can submit DRAFT PRs
  const canSubmit = (pr) => {
    const result = pr.status === 'DRAFT' && isCreator(pr) && user?.role === 'INVENTORY_MANAGER';
    console.log('canSubmit:', result, { status: pr.status, isCreator: isCreator(pr), role: user?.role });
    return result;
  };
  
  // Only admin can approve SUBMITTED PRs
  const canApprove = (pr) => {
    const result = pr.status === 'SUBMITTED' && user?.role === 'ADMIN';
    console.log('canApprove:', result, { status: pr.status, role: user?.role });
    return result;
  };
  
  // Only admin can reject SUBMITTED PRs
  const canReject = (pr) => {
    const result = pr.status === 'SUBMITTED' && user?.role === 'ADMIN';
    console.log('canReject:', result, { status: pr.status, role: user?.role });
    return result;
  };
  
  // Admin can convert APPROVED PRs, or creator manager can convert their own APPROVED PRs
  const canConvert = (pr) => {
    if (pr.status !== 'APPROVED') return false;
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'INVENTORY_MANAGER' && isCreator(pr)) return true;
    console.log('canConvert:', false, { status: pr.status, role: user?.role, isCreator: isCreator(pr) });
    return false;
  };

  console.log('Current User:', user);
  console.log('User Role:', user?.role);
  console.log('Current PRs in state:', prs);
  console.log('PRs count:', prs.length);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Purchase Requisitions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage purchase requests and approvals</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Create PR
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CONVERTED_TO_PO">Converted to PO</option>
          </select>
        </div>

        {/* PR Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">PR Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Requested By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {prs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No PRs found</td>
                  </tr>
                ) : (
                  prs.map((pr) => (
                    <tr key={pr._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{pr.prNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{pr.requestedBy?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{pr.warehouse?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{pr.items?.length} items</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pr.status)}`}>
                          {pr.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {canView(pr) && (
                          <button onClick={() => handleAction(pr._id, 'view')} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                            View
                          </button>
                        )}
                        {canSubmit(pr) && (
                          <button onClick={() => handleAction(pr._id, 'submit')} className="text-blue-600 hover:text-blue-800">
                            Submit
                          </button>
                        )}
                        {canApprove(pr) && (
                          <button onClick={() => handleAction(pr._id, 'approve')} className="text-green-600 hover:text-green-800">
                            Approve
                          </button>
                        )}
                        {canReject(pr) && (
                          <button onClick={() => handleAction(pr._id, 'reject')} className="text-red-600 hover:text-red-800">
                            Reject
                          </button>
                        )}
                        {canConvert(pr) && (
                          <button onClick={() => handleAction(pr._id, 'convert')} className="text-purple-600 hover:text-purple-800">
                            Convert to PO
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create Purchase Requisition</h2>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                {/* Auto-Generated Fields Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">System Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">PR Number:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Auto-generated</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Request Date:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Requested By:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{user?.name || 'Current User'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">DRAFT</span>
                    </div>
                  </div>
                </div>
                
                {/* Request Context */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Request Context</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Warehouse / Location *
                      </label>
                      {user?.role === 'ADMIN' ? (
                        <select
                          value={formData.warehouse}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, warehouse: e.target.value }));
                            // Refresh stock for all selected SKUs
                            formData.items.forEach((item, index) => {
                              if (item.sku) handleSKUChange(index, item.sku);
                            });
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select Warehouse</option>
                          {warehouses.map(wh => (
                            <option key={wh._id} value={wh._id}>{wh.code} - {wh.name}</option>
                          ))}
                        </select>
                      ) : (
                        <>
                          <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                            {(() => {
                              const warehouse = warehouses.find(wh => wh._id === formData.warehouse);
                              return warehouse ? `${warehouse.code} - ${warehouse.name}` : (warehouses.length === 0 ? 'Loading warehouses...' : 'No warehouse assigned');
                            })()}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ℹ️ Auto-selected based on your assigned warehouse
                          </p>
                          <input type="hidden" name="warehouse" value={formData.warehouse} required />
                        </>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Item Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Items</h3>
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Add Item
                    </button>
                  </div>
                  
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Item {index + 1}</h4>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          SKU *
                        </label>
                        <select
                          value={item.sku}
                          onChange={(e) => {
                            // Check if SKU is already selected in another item
                            const skuAlreadySelected = formData.items.some((otherItem, otherIndex) => 
                              otherIndex !== index && otherItem.sku === e.target.value
                            );
                            
                            if (skuAlreadySelected) {
                              alert('This SKU is already selected in another item. Please choose a different SKU.');
                              return;
                            }
                            
                            handleSKUChange(index, e.target.value);
                          }}
                          required
                          disabled={!formData.warehouse}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select SKU</option>
                          {skus.map(sku => {
                            // Check if this SKU is already selected in another item
                            const isAlreadySelected = formData.items.some((otherItem, otherIndex) => 
                              otherIndex !== index && otherItem.sku === sku._id
                            );
                            
                            return (
                              <option 
                                key={sku._id} 
                                value={sku._id}
                                disabled={isAlreadySelected}
                                style={isAlreadySelected ? { color: '#999', fontStyle: 'italic' } : {}}
                              >
                                {sku.skuCode} - {sku.name} {isAlreadySelected ? '(Already selected)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        {!formData.warehouse && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Please select warehouse first</p>
                        )}
                      </div>
                      
                      {selectedSKUs[index] && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Description:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{selectedSKUs[index].name}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Unit:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{selectedSKUs[index].unit || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Current Stock:</span>
                              <p className={`font-medium ${(currentStocks[index] || 0) <= (selectedSKUs[index].minStock || 0) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                {currentStocks[index] || 0} {selectedSKUs[index].unit || 'units'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Min Stock:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{selectedSKUs[index].minStock || 'Not set'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Requested Quantity *
                          </label>
                          <input
                            type="number"
                            value={item.requestedQuantity}
                            onChange={(e) => updateItem(index, 'requestedQuantity', e.target.value)}
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter quantity"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Urgency
                          </label>
                          <select
                            value={item.urgency}
                            onChange={(e) => updateItem(index, 'urgency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Item Remarks
                        </label>
                        <textarea
                          value={item.remarks}
                          onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Notes for this item (optional)"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Required By Date
                    </label>
                    <input
                      type="date"
                      value={formData.requiredByDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiredByDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >                    {submitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}                 {submitting ? 'Creating...' : 'Create PR'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View PR Modal */}
        {showViewModal && selectedPRForView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Purchase Requisition Details
                  </h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Header Info */}
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        PR Number
                      </label>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {selectedPRForView.prNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Status
                      </label>
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPRForView.status)}`}>
                        {selectedPRForView.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Requested By
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedPRForView.requestedBy?.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Warehouse
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedPRForView.warehouse?.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Created At
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedPRForView.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {selectedPRForView.requiredByDate && (
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                          Required By Date
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedPRForView.requiredByDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedPRForView.approvedBy && (
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                          Approved By
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedPRForView.approvedBy?.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="text-sm font-bold uppercase text-gray-700 dark:text-gray-300 mb-3">
                      Items
                    </h3>
                    <div className="space-y-3">
                      {selectedPRForView.items?.map((item, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                SKU
                              </label>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.sku?.skuCode} - {item.sku?.name}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                Requested Quantity
                              </label>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {item.requestedQuantity}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                Urgency
                              </label>
                              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                item.urgency === 'URGENT' ? 'bg-red-100 text-red-800' :
                                item.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                item.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.urgency}
                              </span>
                            </div>
                            {item.remarks && (
                              <div className="col-span-2">
                                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                  Remarks
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {item.remarks}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPRForView.rejectionReason && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-red-500 mb-1">
                        Rejection Reason
                      </label>
                      <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                        {selectedPRForView.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  {user?.role === 'ADMIN' && (selectedPRForView.status === 'DRAFT' || selectedPRForView.status === 'REJECTED') && (
                    <button
                      onClick={() => handleAction(selectedPRForView._id, 'delete')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Delete PR
                    </button>
                  )}
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors ml-auto"
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

export default PurchaseRequisitions;
