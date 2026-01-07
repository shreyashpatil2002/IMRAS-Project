import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import poService from '../../services/poService';
import warehouseService from '../../services/warehouseService';
import transferService from '../../services/transferService';
import authService from '../../services/authService';
import batchService from '../../services/batchService';

const GoodsReceipt = () => {
  const [pos, setPOs] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [receiveData, setReceiveData] = useState({ items: [] });
  const [transferReceiveData, setTransferReceiveData] = useState({ items: [] });
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('po'); // 'po' or 'transfer'
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      
      // Fetch both SENT and PARTIALLY_RECEIVED POs
      const [sentPOs, partialPOs, warehousesRes, transfersRes] = await Promise.all([
        poService.getAllPOs({ status: 'SENT' }),
        poService.getAllPOs({ status: 'PARTIALLY_RECEIVED' }),
        warehouseService.getAllWarehouses(),
        transferService.getAllTransfers({ status: 'IN_TRANSIT' })
      ]);
      
      // Handle POs
      const sentList = sentPOs.data?.pos || sentPOs.pos || [];
      const partialList = partialPOs.data?.pos || partialPOs.pos || [];
      let posList = [...sentList, ...partialList];
      
      // Handle Transfers
      let transfersList = transfersRes?.transfers || transfersRes?.data?.transfers || transfersRes?.data || [];
      
      // Filter by assigned warehouse for non-admin users
      if (currentUser?.role !== 'ADMIN' && currentUser?.assignedWarehouse) {
        // Filter POs
        posList = posList.filter(po => {
          const poWarehouseId = po.warehouse?._id || po.warehouse;
          return String(poWarehouseId) === String(currentUser.assignedWarehouse);
        });
        
        // Filter Transfers (only show IN_TRANSIT transfers to destination warehouse)
        transfersList = transfersList.filter(transfer => {
          const destId = transfer.destinationWarehouse?._id || transfer.destinationWarehouse;
          return String(destId) === String(currentUser.assignedWarehouse);
        });
      }
      
      const warehousesList = warehousesRes.data?.warehouses || warehousesRes.warehouses || [];
      
      setPOs(posList);
      setTransfers(transfersList);
      setWarehouses(warehousesList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = (po) => {
    setSelectedPO(po);
    const items = po.items.map(item => ({
      sku: item.sku._id,
      skuCode: item.sku.skuCode,
      skuName: item.sku.name,
      orderedQuantity: item.orderedQuantity,
      alreadyReceived: item.receivedQuantity || 0,
      remainingQuantity: item.orderedQuantity - (item.receivedQuantity || 0),
      receivedCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      batchNumber: '',
      expiryDate: ''
    }));
    setReceiveData({ items });
    setShowReceiveModal(true);
  };

  const updateReceiveItem = (index, field, value) => {
    setReceiveData(prev => ({
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-calculate rejected count when received or accepted changes
          if (field === 'receivedCount' || field === 'acceptedCount') {
            const received = field === 'receivedCount' ? parseInt(value) || 0 : parseInt(updatedItem.receivedCount) || 0;
            const accepted = field === 'acceptedCount' ? parseInt(value) || 0 : parseInt(updatedItem.acceptedCount) || 0;
            updatedItem.rejectedCount = Math.max(0, received - accepted);
            
            // Ensure accepted doesn't exceed received
            if (field === 'acceptedCount' && accepted > received) {
              updatedItem.acceptedCount = received;
              updatedItem.rejectedCount = 0;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const updateReceiveItemLocation = (index, field, value) => {
    setReceiveData(prev => ({
      items: prev.items.map((item, i) => 
        i === index ? { ...item, location: { ...item.location, [field]: value } } : item
      )
    }));
  };

  const handleSubmitReceive = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    try {
      // Filter items with acceptedCount > 0 (only accepted items go to inventory)
      const itemsToReceive = receiveData.items.filter(item => item.acceptedCount > 0);

      if (itemsToReceive.length === 0) {
        alert('Please enter accepted quantities for at least one item');
        return;
      }

      // Validate batch numbers
      for (const item of itemsToReceive) {
        if (!item.batchNumber || item.batchNumber.trim() === '') {
          alert(`Batch number is required for ${item.skuCode} - ${item.skuName}`);
          return;
        }
      }

      // Check for duplicate batch numbers in the warehouse
      const warehouseId = selectedPO.warehouse?._id || selectedPO.warehouse;
      const batchesResponse = await batchService.getAllBatches();
      const allBatches = batchesResponse?.data?.batches || batchesResponse?.batches || [];
      
      for (const item of itemsToReceive) {
        const batchNumber = item.batchNumber.trim().toUpperCase();
        const duplicateBatch = allBatches.find(batch => {
          const batchWarehouseId = batch.warehouse?._id || batch.warehouse;
          return batch.batchNumber.toUpperCase() === batchNumber && 
                 String(batchWarehouseId) === String(warehouseId);
        });
        
        if (duplicateBatch) {
          alert(`Batch number "${item.batchNumber}" already exists in this warehouse. Please use a different batch number for ${item.skuCode} - ${item.skuName}`);
          return;
        }
      }

      // Prepare data for backend - backend expects skuId and receivedQuantity (use acceptedCount)
      const items = itemsToReceive.map(item => ({
        skuId: item.sku,
        receivedQuantity: parseInt(item.acceptedCount), // Only accepted items go to stock
        batchNumber: item.batchNumber.trim(),
        expiryDate: item.expiryDate || undefined
      }));

      setSubmitting(true);
      const response = await poService.receivePO(selectedPO._id, items);
      
      alert(`Goods received successfully! ${items.length} item(s) received and stock updated.`);
      setShowReceiveModal(false);
      setSelectedPO(null);
      fetchData();
    } catch (error) {
      console.error('Error receiving goods:', error);
      alert(error.response?.data?.message || 'Failed to receive goods');
    } finally {
      setSubmitting(false);
    }
  };

  // Transfer Receive Handlers
  const handleReceiveTransfer = (transfer) => {
    setSelectedTransfer(transfer);
    const items = transfer.items.map(item => ({
      sku: item.sku._id || item.sku,
      skuCode: item.sku.skuCode || 'N/A',
      skuName: item.sku.name || 'Unknown',
      quantity: item.quantity,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      receivedCount: 0,
      acceptedCount: 0,
      rejectedCount: 0
    }));
    setTransferReceiveData({ items });
    setShowTransferModal(true);
  };

  const updateTransferReceiveItem = (index, field, value) => {
    setTransferReceiveData(prev => ({
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-calculate rejected count
          if (field === 'receivedCount' || field === 'acceptedCount') {
            const received = field === 'receivedCount' ? parseInt(value) || 0 : parseInt(updatedItem.receivedCount) || 0;
            const accepted = field === 'acceptedCount' ? parseInt(value) || 0 : parseInt(updatedItem.acceptedCount) || 0;
            updatedItem.rejectedCount = Math.max(0, received - accepted);
            
            if (field === 'acceptedCount' && accepted > received) {
              updatedItem.acceptedCount = received;
              updatedItem.rejectedCount = 0;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleSubmitTransferReceive = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    try {
      const itemsToReceive = transferReceiveData.items.filter(item => item.acceptedCount > 0);

      if (itemsToReceive.length === 0) {
        alert('Please enter accepted quantities for at least one item');
        return;
      }

      setSubmitting(true);
      await transferService.receiveTransfer(selectedTransfer._id);
      
      alert(`Transfer received successfully! Items are now in RECEIVING area. Please proceed with putaway.`);
      setShowTransferModal(false);
      setSelectedTransfer(null);
      fetchData();
    } catch (error) {
      console.error('Error receiving transfer:', error);
      alert(error.response?.data?.message || 'Failed to receive transfer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Goods Receipt (GRN)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Receive incoming goods from suppliers and warehouse transfers</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('po')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'po'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Purchase Orders ({pos.length})
              </button>
              <button
                onClick={() => setActiveTab('transfer')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'transfer'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Warehouse Transfers ({transfers.length})
              </button>
            </nav>
          </div>
        </div>

        {/* PO List */}
        {activeTab === 'po' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading purchase orders...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">PO Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expected Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No purchase orders awaiting receipt
                    </td>
                  </tr>
                ) : (
                  pos.map((po) => {
                    const pendingItems = po.items.filter(item => 
                      item.receivedQuantity < item.orderedQuantity
                    ).length;
                    return (
                    <tr key={po._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{po.poNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{po.supplier?.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          po.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {po.status === 'SENT' ? 'Sent' : 'Partially Received'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {po.items?.length} items ({pendingItems} pending)
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleReceive(po)}
                          className="text-primary hover:text-blue-700 font-medium"
                        >
                          Receive Goods
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        )}

        {/* Transfer List */}
        {activeTab === 'transfer' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading warehouse transfers...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Transfer #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">From Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Dispatched Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No warehouse transfers awaiting receipt
                    </td>
                  </tr>
                ) : (
                  transfers.map((transfer) => (
                    <tr key={transfer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{transfer.transferNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{transfer.sourceWarehouse?.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          In Transit
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {transfer.items?.length} items
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {transfer.dispatchedDate ? new Date(transfer.dispatchedDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleReceiveTransfer(transfer)}
                          className="text-primary hover:text-blue-700 font-medium"
                        >
                          Receive Transfer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        )}

        {/* PO Receive Modal */}
        {showReceiveModal && selectedPO && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Goods Receipt Note (GRN)</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">PO Number: {selectedPO.poNumber}</p>
                </div>
                <button
                  onClick={() => { setShowReceiveModal(false); setSelectedPO(null); }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitReceive}>
                {/* PO Info */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 dark:bg-gray-700">
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
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedPO.status === 'SENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }`}>
                      {selectedPO.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expected Delivery</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Items to Receive</h3>
                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SKU</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Item Name</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ordered</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Already Received</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Remaining</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Received Count *</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Accepted Count *</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rejected Count</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Batch # *</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expiry Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {receiveData.items.map((item, index) => (
                          <tr key={index} className={`${
                            item.remainingQuantity === 0 ? 'bg-green-50 dark:bg-green-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.skuCode}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.skuName}</td>
                            <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.orderedQuantity}</td>
                            <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">{item.alreadyReceived}</td>
                            <td className="px-4 py-3 text-center font-semibold text-orange-600 dark:text-orange-400">{item.remainingQuantity}</td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                value={item.receivedCount}
                                onChange={(e) => updateReceiveItem(index, 'receivedCount', e.target.value)}
                                max={item.remainingQuantity}
                                min="0"
                                disabled={item.remainingQuantity === 0}
                                className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                value={item.acceptedCount}
                                onChange={(e) => updateReceiveItem(index, 'acceptedCount', e.target.value)}
                                max={item.receivedCount || 0}
                                min="0"
                                disabled={item.remainingQuantity === 0}
                                className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className={`inline-flex items-center justify-center w-20 px-2 py-2 rounded-lg font-semibold ${
                                item.rejectedCount > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {item.rejectedCount}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={item.batchNumber}
                                onChange={(e) => updateReceiveItem(index, 'batchNumber', e.target.value)}
                                placeholder="BATCH001"
                                disabled={item.remainingQuantity === 0}
                                className="w-32 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:bg-gray-700 dark:text-white"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="date"
                                value={item.expiryDate}
                                onChange={(e) => updateReceiveItem(index, 'expiryDate', e.target.value)}
                                disabled={item.remainingQuantity === 0}
                                className="w-36 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:bg-gray-700 dark:text-white"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">* Required fields. Rejected Count = Received Count - Accepted Count (auto-calculated)</p>
                </div>

                {/* Summary Section */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {receiveData.items.reduce((sum, item) => sum + (parseInt(item.receivedCount) || 0), 0)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Received</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {receiveData.items.reduce((sum, item) => sum + (parseInt(item.acceptedCount) || 0), 0)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Accepted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {receiveData.items.reduce((sum, item) => sum + (parseInt(item.rejectedCount) || 0), 0)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Rejected</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        {receiveData.items.reduce((sum, item) => sum + item.remainingQuantity, 0)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Still Pending</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 px-6 pb-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {submitting ? 'Processing...' : 'Confirm Receipt'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowReceiveModal(false); setSelectedPO(null); }}
                    disabled={submitting}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Receive Modal */}
        {showTransferModal && selectedTransfer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Transfer Receipt</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Transfer #: {selectedTransfer.transferNumber}</p>
                </div>
                <button
                  onClick={() => { setShowTransferModal(false); setSelectedTransfer(null); }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitTransferReceive}>
                {/* Transfer Info */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">From Warehouse</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedTransfer.sourceWarehouse?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTransfer.sourceWarehouse?.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">To Warehouse</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedTransfer.destinationWarehouse?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTransfer.destinationWarehouse?.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dispatched Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedTransfer.dispatchedDate ? new Date(selectedTransfer.dispatchedDate).toLocaleDateString() : 'N/A'}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mt-1">
                      IN TRANSIT
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Items to Receive</h3>
                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SKU</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Item Name</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Batch #</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expected Qty</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Received *</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Accepted *</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rejected</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expiry Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transferReceiveData.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.skuCode}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.skuName}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-mono text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                {item.batchNumber}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">{item.quantity}</td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                value={item.receivedCount}
                                onChange={(e) => updateTransferReceiveItem(index, 'receivedCount', e.target.value)}
                                max={item.quantity}
                                min="0"
                                className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                value={item.acceptedCount}
                                onChange={(e) => updateTransferReceiveItem(index, 'acceptedCount', e.target.value)}
                                max={item.receivedCount || 0}
                                min="0"
                                className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className={`inline-flex items-center justify-center w-20 px-2 py-2 rounded-lg font-semibold ${
                                item.rejectedCount > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {item.rejectedCount}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    * Received and accepted quantities. Items will be placed in RECEIVING area for putaway.
                  </p>
                </div>

                {/* Summary Section */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {transferReceiveData.items.reduce((sum, item) => sum + (parseInt(item.receivedCount) || 0), 0)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Received</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {transferReceiveData.items.reduce((sum, item) => sum + (parseInt(item.acceptedCount) || 0), 0)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Accepted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {transferReceiveData.items.reduce((sum, item) => sum + (parseInt(item.rejectedCount) || 0), 0)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Rejected</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-semibold">ℹ️ Note:</span> After confirming receipt, items will be placed in the RECEIVING area. 
                      Please proceed to the Putaway page to assign storage locations.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 px-6 pb-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {submitting ? 'Processing...' : 'Confirm Transfer Receipt'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowTransferModal(false); setSelectedTransfer(null); }}
                    disabled={submitting}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GoodsReceipt;
