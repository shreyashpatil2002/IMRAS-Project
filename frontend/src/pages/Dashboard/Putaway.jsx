import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import batchService from '../../services/batchService';
import warehouseService from '../../services/warehouseService';

const Putaway = () => {
  const [pendingBatches, setPendingBatches] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPutawayModal, setShowPutawayModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [newLocation, setNewLocation] = useState({ aisle: '', bin: '', section: '' });
  const [suggestedLocation, setSuggestedLocation] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchesRes, warehousesRes] = await Promise.all([
        batchService.getAllBatches(),
        warehouseService.getAllWarehouses()
      ]);
      
      const batches = batchesRes.data?.batches || batchesRes.batches || [];
      const warehousesList = warehousesRes.data?.warehouses || warehousesRes.warehouses || [];
      
      // Filter batches in RECEIVING location (pending putaway)
      const pending = batches.filter(batch => 
        batch.location && batch.location.startsWith('RECEIVING')
      );
      
      setAllBatches(batches);
      setPendingBatches(pending);
      setWarehouses(warehousesList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePutaway = (batch) => {
    setSelectedBatch(batch);
    
    // Find batches with matching product/SKU that are already stored in the SAME warehouse
    const matchingBatches = allBatches.filter(b => 
      b.product?._id === batch.product?._id && 
      b.warehouse?._id === batch.warehouse?._id &&
      b._id !== batch._id && 
      b.location && 
      !b.location.startsWith('RECEIVING') &&
      b.currentQuantity > 0
    );
    
    if (matchingBatches.length > 0) {
      // Get the most common location or the most recent one
      const locationCounts = {};
      matchingBatches.forEach(b => {
        locationCounts[b.location] = (locationCounts[b.location] || 0) + 1;
      });
      
      // Find location with highest count
      const suggestedLoc = Object.keys(locationCounts).reduce((a, b) => 
        locationCounts[a] > locationCounts[b] ? a : b
      );
      
      const [aisle, section, bin] = suggestedLoc.split('-');
      setSuggestedLocation({ 
        location: suggestedLoc, 
        aisle: aisle || '', 
        section: section || '', 
        bin: bin || '',
        count: matchingBatches.length 
      });
      setNewLocation({ aisle: aisle || '', section: section || '', bin: bin || '' });
    } else {
      setSuggestedLocation(null);
      setNewLocation({ aisle: '', bin: '', section: '' });
    }
    
    setShowPutawayModal(true);
  };

  const handleConfirmPutaway = async (e) => {
    e.preventDefault();
    try {
      const locationString = `${newLocation.aisle}-${newLocation.section}-${newLocation.bin}`;
      
      // Check if another product exists at this location
      const batchesAtLocation = allBatches.filter(b => 
        b.location === locationString && 
        b.currentQuantity > 0 &&
        b._id !== selectedBatch._id
      );
      
      if (batchesAtLocation.length > 0) {
        // Check if any batch has a different product/SKU
        const differentProducts = batchesAtLocation.filter(b => 
          b.product?._id !== selectedBatch.product?._id
        );
        
        if (differentProducts.length > 0) {
          const productNames = differentProducts.map(b => b.product?.name || 'Unknown').join(', ');
          const skuCodes = differentProducts.map(b => b.product?.sku || 'N/A').join(', ');
          
          const confirmed = window.confirm(
            `⚠️ WARNING: Location ${locationString} already contains different product(s)!\n\n` +
            `Existing Product(s): ${productNames}\n` +
            `SKU(s): ${skuCodes}\n\n` +
            `Current Product: ${selectedBatch.product?.name || 'Unknown'}\n` +
            `SKU: ${selectedBatch.product?.sku || 'N/A'}\n\n` +
            `Mixing different products in the same bin location is not recommended.\n\n` +
            `Do you want to proceed anyway?`
          );
          
          if (!confirmed) {
            return; // User cancelled, don't proceed with putaway
          }
        }
      }
      
      await batchService.updateBatch(selectedBatch._id, {
        location: locationString
      });
      
      alert(`Batch ${selectedBatch.batchNumber} successfully moved to ${locationString}`);
      setShowPutawayModal(false);
      setSelectedBatch(null);
      fetchData();
    } catch (error) {
      console.error('Error updating batch location:', error);
      alert(error.response?.data?.message || 'Failed to update location');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryStatus = (days) => {
    if (days === null) return { color: 'text-gray-600', text: 'N/A' };
    if (days < 0) return { color: 'text-red-600', text: 'Expired' };
    if (days <= 30) return { color: 'text-orange-600', text: `${days} days` };
    if (days <= 90) return { color: 'text-yellow-600', text: `${days} days` };
    return { color: 'text-green-600', text: `${days} days` };
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Putaway Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Assign storage locations to received goods</p>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading pending putaway items...</p>
            </div>
          </div>
        ) : (
          <>
            {pendingBatches.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="text-center py-12">
                  <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    All Items Stored
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No items pending putaway. All received goods have been assigned to storage locations.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">{pendingBatches.length}</span> batch(es) awaiting putaway
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Batch Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Received Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expiry Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Days to Expiry</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Current Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {pendingBatches.map((batch) => {
                        const daysToExpiry = getDaysUntilExpiry(batch.expiryDate);
                        const expiryStatus = getExpiryStatus(daysToExpiry);
                        return (
                          <tr key={batch._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {batch.batchNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {batch.product?.name || 'N/A'}
                              {batch.product?.sku && (
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                  SKU: {batch.product.sku}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-center font-semibold text-gray-900 dark:text-white">
                              {batch.currentQuantity}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(batch.receivedDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(batch.expiryDate)}
                            </td>
                            <td className={`px-6 py-4 text-sm font-medium ${expiryStatus.color}`}>
                              {expiryStatus.text}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {batch.supplier?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium">
                                {batch.location}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => handlePutaway(batch)}
                                className="text-primary hover:text-blue-700 font-medium"
                              >
                                Assign Location
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Putaway Modal */}
        {showPutawayModal && selectedBatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Assign Storage Location</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Batch: {selectedBatch.batchNumber}</p>
                </div>
                <button
                  onClick={() => { setShowPutawayModal(false); setSelectedBatch(null); }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleConfirmPutaway}>
                {/* Batch Info */}
                <div className="p-6 bg-gray-50 dark:bg-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Product</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedBatch.product?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quantity</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedBatch.currentQuantity} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedBatch.expiryDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Supplier</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedBatch.supplier?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Location Input */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Storage Location Details</h3>
                  
                  {/* Suggested Location Alert */}
                  {suggestedLocation && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">lightbulb</span>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                            Suggested Location
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                            {suggestedLocation.count} batch(es) of the same product already stored at:
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 rounded font-mono font-bold">
                              {suggestedLocation.location}
                            </code>
                            <span className="text-xs text-blue-600 dark:text-blue-400">← Pre-filled below</span>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                            💡 Tip: Storing same products together improves picking efficiency
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Aisle *
                      </label>
                      <input
                        type="text"
                        value={newLocation.aisle}
                        onChange={(e) => setNewLocation({ ...newLocation, aisle: e.target.value.toUpperCase() })}
                        placeholder="A"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Section *
                      </label>
                      <input
                        type="text"
                        value={newLocation.section}
                        onChange={(e) => setNewLocation({ ...newLocation, section: e.target.value.toUpperCase() })}
                        placeholder="01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bin *
                      </label>
                      <input
                        type="text"
                        value={newLocation.bin}
                        onChange={(e) => setNewLocation({ ...newLocation, bin: e.target.value.toUpperCase() })}
                        placeholder="001"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  {newLocation.aisle && newLocation.section && newLocation.bin && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Final Location Code:</p>
                      <p className="text-lg font-bold text-primary">
                        {newLocation.aisle}-{newLocation.section}-{newLocation.bin}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 px-6 pb-6">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                  >
                    Confirm Putaway
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowPutawayModal(false); setSelectedBatch(null); }}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Putaway Best Practices:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li>Place fast-moving items near dispatch areas</li>
            <li>Store heavy items on lower shelves</li>
            <li>Group similar items together for easier picking</li>
            <li>Prioritize items with earlier expiry dates (FIFO - First In, First Out)</li>
            <li>Update location immediately after placement</li>
            <li>Use clear labeling for easy identification</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Putaway;
