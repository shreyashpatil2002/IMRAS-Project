import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import authService from '../../services/authService';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('30 Days');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const stats = [
    {
      title: 'Total Inventory Value',
      value: '1,240,500',
      icon: 'paid',
      color: 'blue',
      trend: '+2.5%',
      trendUp: true
    },
    {
      title: 'Low Stock Items',
      value: '14 Items',
      icon: 'warning',
      color: 'red',
      badge: 'Action Needed',
      badgeColor: 'red'
    },
    {
      title: 'Pending Reorders',
      value: '8 Orders',
      icon: 'local_shipping',
      color: 'purple',
      badge: 'Same as yesterday',
      badgeColor: 'gray'
    },
    {
      title: 'Monthly Turnover Rate',
      value: '12%',
      icon: 'sync_alt',
      color: 'orange',
      trend: '-1.2%',
      trendUp: false
    }
  ];

  const reorderSuggestions = [
    {
      name: 'Wireless Controller V2',
      sku: 'WC-002-BL',
      currentLevel: 12,
      status: 'Critical',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjsb5j-1dBArRvIDF1QwpJ6ltXTwRnnoMTiC7M-Q0Ojmq1yN1uivi52tRjIthXjfDtB5bzt9dqu9JbIQFGU71v3LAmGBJoR2jTO1q0gT87Z0kUO7ZqEC4aUiVtADnB5-kWIgSE8vLbJoQc9Zhc4vduP9is9wYA2DzAZuT5rmGdjOeBaKXs20juMg09oVOEYtW7IPcTXQEOvudDqhzwg7Ny0CcXI5USi4iXh4SLfjZIuFz1gC_X1ac8FekHkppmbpRfRPqhmeAngw'
    },
    {
      name: 'HDMI Cable 5m',
      sku: 'CB-HDMI-50',
      currentLevel: 8,
      status: 'Critical',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvkdGeSOxGUaxsOUm9RIcg0XI38ZaYEbCorN5why92-feowISFLOzmPpKFBfSUsNMhKbyT1EbgKzO8UOKquknXtz3jeUAPf-arSNmdN45QJHfT6EKkBKDulHPkzP7TlDNzKv0oAIBlHKrvjRp9XQ8SJu3Ur10vfdHpMa1JeGDJH1ZCWLAovD6oadX_1sed8zTvOjzUEukLYy-7DPEDmA7vfw-osYvvJyUSj-2cTUaUF6GehmLHiZdMNy1_W8sWZtnNo464Mv9jdA'
    },
    {
      name: 'Mech Keyboard MK1',
      sku: 'MK-001-RGB',
      currentLevel: 24,
      status: 'Low Stock',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmY3L8H7etoYsnIIQUO6I3dl-E8_ZQDGfNyjl1Wj8kfdLNezpix0muM5S7hh_kpMyLJ9dWp9oOoIrGxjBU1Z0vrfoH1nxQj-zeWZDccLqi9u11Vd_EljTweNiaDcELvsqOhZaowZJ9WR1wEBjiNY7pKqeg8Vi1gvNFkmFCgYyX9GD-T-Xh8T33STzdL70kepfhl3QwyfUHXzNAknj16dRsryfgHH4qr1_aZkfNQ135JP-bpCCSYAGYaSUFPUU96x5sphsofkrh4A'
    },
    {
      name: 'Gaming Mouse X7',
      sku: 'GM-X7-PRO',
      currentLevel: 31,
      status: 'Low Stock',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCciwpgXkVQhTmdbQkSJ9TbwlxfxQFM0y1kD0qjOXoPBts5sDCAn7Avd1lCzTUs5Un7BznW016tEwODE20YefOklbDzICLKHzWSDq0H8LW3PImNBxzO0U4mejf42hkbHAP7qTI0n6apBLR3DAf7YcHmCiwZOG0ZdSCZekbqjhJHpQ7n2Ubhn8rH_3jUs-NKOkqr9nPhAAO4DZNLGl7U0GIneTpRVRP201DsbEAJGTiWoSUdx7avBQOCu0CDimdlEKHUaDdmiUHdTA'
    }
  ];

  const stockMovements = [
    { type: 'received', title: 'Stock Received: #PO-8821', description: 'Received 500 units of USB-C Cables', time: '2m ago', icon: 'arrow_downward', color: 'green' },
    { type: 'dispatched', title: 'Order Dispatched: #ORD-4501', description: 'Packed by Warehouse A', time: '15m ago', icon: 'arrow_upward', color: 'blue' },
    { type: 'adjusted', title: 'Stock Adjusted', description: '-2 units (Damaged) WC-002-BL', time: '1h ago', icon: 'edit', color: 'orange' },
    { type: 'reorder', title: 'Reorder Approved', description: 'Supplier: TechGiant Corp', time: '3h ago', icon: 'local_shipping', color: 'purple' },
    { type: 'dispatched', title: 'Order Dispatched: #ORD-4499', description: 'Packed by Warehouse B', time: '4h ago', icon: 'arrow_upward', color: 'blue' }
  ];

  // Staff-specific data
  const tasksToday = [
    { id: 1, task: 'Check incoming shipment from Supplier X', priority: 'High', status: 'Pending', time: '10:00 AM' },
    { id: 2, task: 'Update batch records for Product ABC', priority: 'Medium', status: 'In Progress', time: '11:30 AM' },
    { id: 3, task: 'Prepare items for Transfer #TR-4521', priority: 'High', status: 'Pending', time: '2:00 PM' },
    { id: 4, task: 'Verify stock count for Warehouse A', priority: 'Low', status: 'Pending', time: '4:00 PM' }
  ];

  const pendingGRNs = [
    { id: 'GRN-1023', poNumber: 'PO-8821', supplier: 'TechGiant Corp', items: 15, expectedDate: 'Today', status: 'Awaiting Receipt' },
    { id: 'GRN-1024', poNumber: 'PO-8819', supplier: 'ElectroParts Ltd', items: 8, expectedDate: 'Today', status: 'Partially Received' },
    { id: 'GRN-1022', poNumber: 'PO-8815', supplier: 'Global Supplies', items: 22, expectedDate: 'Yesterday', status: 'Overdue' }
  ];

  const transfersToDispatch = [
    { id: 'TR-4521', from: 'Warehouse A', to: 'Warehouse B', items: 12, status: 'Ready to Ship', requestedBy: 'Manager John', priority: 'High' },
    { id: 'TR-4519', from: 'Warehouse A', to: 'Warehouse C', items: 5, status: 'Packing', requestedBy: 'Staff Sarah', priority: 'Medium' }
  ];

  const transfersToReceive = [
    { id: 'TR-4518', from: 'Warehouse B', to: 'Warehouse A', items: 8, status: 'In Transit', eta: '2 hours', priority: 'High' },
    { id: 'TR-4515', from: 'Warehouse C', to: 'Warehouse A', items: 15, status: 'In Transit', eta: '4 hours', priority: 'Medium' },
    { id: 'TR-4512', from: 'Warehouse B', to: 'Warehouse A', items: 3, status: 'Delayed', eta: 'Unknown', priority: 'Low' }
  ];

  const expiryAlerts = [
    { sku: 'MED-001', name: 'Medical Supply Alpha', batch: 'BATCH-2024-05', quantity: 120, expiryDate: '2025-01-15', daysLeft: 16, severity: 'Warning' },
    { sku: 'FOOD-045', name: 'Packaged Snacks Box', batch: 'BATCH-2024-12', quantity: 85, expiryDate: '2025-01-05', daysLeft: 6, severity: 'Critical' },
    { sku: 'CHEM-012', name: 'Cleaning Solution Pro', batch: 'BATCH-2024-08', quantity: 45, expiryDate: '2025-02-20', daysLeft: 52, severity: 'Info' },
    { sku: 'MED-007', name: 'First Aid Kit Standard', batch: 'BATCH-2024-11', quantity: 30, expiryDate: '2025-01-10', daysLeft: 11, severity: 'Warning' }
  ];

  // If user is staff, show limited dashboard
  if (userRole === 'WAREHOUSE_STAFF') {
    return (
      <DashboardLayout title="Dashboard">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          {/* Tasks Assigned Today */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Tasks Assigned Today</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {tasksToday.filter(t => t.status === 'Pending').length} pending tasks
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Task</th>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3 text-center">Priority</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tasksToday.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4 font-medium">{task.task}</td>
                      <td className="px-5 py-4 text-gray-500">{task.time}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'High'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : task.priority === 'Medium'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'Pending'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending GRNs and Transfers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending GRNs */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Pending GRNs</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Goods Receipt Notes awaiting processing
                </p>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {pendingGRNs.map((grn) => (
                  <div key={grn.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-primary">{grn.id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">PO: {grn.poNumber}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        grn.status === 'Overdue'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : grn.status === 'Partially Received'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {grn.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{grn.supplier}</span>
                      <span className="text-gray-500">{grn.items} items</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Expected: {grn.expectedDate}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfers to Dispatch */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Transfers to Dispatch</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Outgoing warehouse transfers
                </p>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {transfersToDispatch.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-primary">{transfer.id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transfer.from} → {transfer.to}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transfer.priority === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {transfer.priority}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{transfer.items} items</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{transfer.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">By: {transfer.requestedBy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transfers to Receive and Expiry Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transfers to Receive */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Transfers to Receive</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Incoming warehouse transfers
                </p>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {transfersToReceive.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-primary">{transfer.id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          From: {transfer.from}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transfer.status === 'Delayed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {transfer.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{transfer.items} items</span>
                      <span className="text-gray-500">ETA: {transfer.eta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry Alerts (View Only) */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Expiry Alerts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Items approaching expiration (View Only)
                </p>
              </div>
              <div className="p-5 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
                {expiryAlerts.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.sku}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.severity === 'Critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : item.severity === 'Warning'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {item.daysLeft} days left
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Batch: {item.batch}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Expires: {item.expiryDate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Manager-specific data
  const inboundShipments = [
    { id: 'SHP-5821', poNumber: 'PO-8825', supplier: 'TechGiant Corp', items: 25, expectedTime: '10:00 AM', status: 'On Schedule', type: 'Purchase Order' },
    { id: 'SHP-5822', poNumber: 'PO-8826', supplier: 'ElectroParts Ltd', items: 12, expectedTime: '1:30 PM', status: 'Delayed', type: 'Purchase Order' },
    { id: 'SHP-5823', poNumber: 'PO-8829', supplier: 'Global Supplies', items: 45, expectedTime: '3:00 PM', status: 'On Schedule', type: 'Purchase Order' },
    { id: 'SHP-5824', poNumber: 'PO-8830', supplier: 'Premium Parts Inc', items: 8, expectedTime: '4:30 PM', status: 'Confirmed', type: 'Purchase Order' }
  ];

  const pendingTransferReceipts = [
    { id: 'TR-4530', from: 'Warehouse B', items: 18, sku: 'Various SKUs', expectedTime: '11:00 AM', status: 'In Transit', priority: 'High' },
    { id: 'TR-4531', from: 'Warehouse C', items: 7, sku: 'MED-001, FOOD-045', expectedTime: '2:00 PM', status: 'In Transit', priority: 'Medium' },
    { id: 'TR-4532', from: 'Warehouse D', items: 22, sku: 'Various SKUs', expectedTime: '5:00 PM', status: 'Delayed', priority: 'Low' }
  ];

  const lowStockAlerts = [
    { sku: 'WC-002-BL', name: 'Wireless Controller V2', currentStock: 12, reorderPoint: 50, status: 'Critical', warehouse: 'Main Storage' },
    { sku: 'HDMI-50', name: 'HDMI Cable 5m', currentStock: 8, reorderPoint: 30, status: 'Critical', warehouse: 'Section A' },
    { sku: 'MK-001-RGB', name: 'Mech Keyboard MK1', currentStock: 24, reorderPoint: 40, status: 'Low', warehouse: 'Main Storage' },
    { sku: 'GM-X7-PRO', name: 'Gaming Mouse X7', currentStock: 31, reorderPoint: 50, status: 'Low', warehouse: 'Section B' },
    { sku: 'USB-C-30', name: 'USB-C Cable 3m', currentStock: 15, reorderPoint: 35, status: 'Low', warehouse: 'Section A' }
  ];

  const expiryAlertsManager = {
    next30Days: [
      { sku: 'FOOD-045', name: 'Packaged Snacks Box', batch: 'BATCH-2024-12', quantity: 85, expiryDate: '2025-01-05', daysLeft: 6, location: 'Shelf A-12' },
      { sku: 'MED-007', name: 'First Aid Kit Standard', batch: 'BATCH-2024-11', quantity: 30, expiryDate: '2025-01-10', daysLeft: 11, location: 'Shelf C-05' },
      { sku: 'MED-001', name: 'Medical Supply Alpha', batch: 'BATCH-2024-05', quantity: 120, expiryDate: '2025-01-15', daysLeft: 16, location: 'Shelf C-08' }
    ],
    next60Days: [
      { sku: 'CHEM-012', name: 'Cleaning Solution Pro', batch: 'BATCH-2024-08', quantity: 45, expiryDate: '2025-02-20', daysLeft: 52, location: 'Shelf D-15' },
      { sku: 'FOOD-089', name: 'Energy Drink Pack', batch: 'BATCH-2024-10', quantity: 95, expiryDate: '2025-02-28', daysLeft: 60, location: 'Shelf A-18' }
    ]
  };

  // If user is manager, show warehouse manager dashboard
  if (userRole === 'INVENTORY_MANAGER') {
    return (
      <DashboardLayout title="Dashboard">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          {/* Today's Inbound Shipments */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Today's Inbound Shipments</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {inboundShipments.filter(s => s.status !== 'Delayed').length} of {inboundShipments.length} on schedule
                </p>
              </div>
              <span className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                {inboundShipments.length} Expected
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Shipment ID</th>
                    <th className="px-5 py-3">PO Number</th>
                    <th className="px-5 py-3">Supplier</th>
                    <th className="px-5 py-3 text-center">Items</th>
                    <th className="px-5 py-3">Expected Time</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {inboundShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-primary">{shipment.id}</td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">{shipment.poNumber}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{shipment.supplier}</td>
                      <td className="px-5 py-4 text-center font-bold">{shipment.items}</td>
                      <td className="px-5 py-4">{shipment.expectedTime}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          shipment.status === 'Delayed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : shipment.status === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Transfer Receipts & Tasks Today */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Transfer Receipts */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Pending Transfer Receipts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Incoming warehouse transfers</p>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {pendingTransferReceipts.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-primary">{transfer.id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">From: {transfer.from}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transfer.status === 'Delayed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {transfer.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <p className="truncate">SKUs: {transfer.sku}</p>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-bold">{transfer.items} items</span>
                      <span>ETA: {transfer.expectedTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Assigned Today */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Tasks Assigned Today</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {tasksToday.filter(t => t.status === 'Pending').length} pending tasks
                </p>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {tasksToday.map((task) => (
                  <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium pr-2">{task.task}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : task.priority === 'Medium'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{task.time}</span>
                      <span className={`font-medium ${
                        task.status === 'Pending' ? 'text-gray-600 dark:text-gray-300' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Alerts (View Only) */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold">Low Stock Alerts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Items below reorder point (View Only)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">SKU</th>
                    <th className="px-5 py-3">Product Name</th>
                    <th className="px-5 py-3">Warehouse Location</th>
                    <th className="px-5 py-3 text-center">Current Stock</th>
                    <th className="px-5 py-3 text-center">Reorder Point</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {lowStockAlerts.map((alert, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">{alert.sku}</td>
                      <td className="px-5 py-4 font-medium">{alert.name}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400 text-xs">{alert.warehouse}</td>
                      <td className="px-5 py-4 text-center font-bold text-red-600 dark:text-red-400">{alert.currentStock}</td>
                      <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-400">{alert.reorderPoint}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.status === 'Critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expiry Alerts (Next 30 / 60 Days) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Next 30 Days */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Expiry Alerts - Next 30 Days</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {expiryAlertsManager.next30Days.length} items expiring soon
                </p>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {expiryAlertsManager.next30Days.map((item, index) => (
                  <div key={index} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-r-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">{item.sku}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        {item.daysLeft} days left
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span>Batch: {item.batch}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>Location: {item.location}</span>
                      <span>Expires: {item.expiryDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next 60 Days */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Expiry Alerts - Next 60 Days</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {expiryAlertsManager.next60Days.length} items to monitor
                </p>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {expiryAlertsManager.next60Days.map((item, index) => (
                  <div key={index} className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-r-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">{item.sku}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                        {item.daysLeft} days left
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span>Batch: {item.batch}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>Location: {item.location}</span>
                      <span>Expires: {item.expiryDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Admin-specific data
  const todaysGRNs = [
    { id: 'GRN-1025', poNumber: 'PO-8825', supplier: 'TechGiant Corp', items: 15, value: '12,450', status: 'Completed', time: '09:30 AM' },
    { id: 'GRN-1026', poNumber: 'PO-8827', supplier: 'ElectroParts Ltd', items: 8, value: '5,280', status: 'In Progress', time: '11:15 AM' },
    { id: 'GRN-1027', poNumber: 'PO-8828', supplier: 'Global Supplies', items: 22, value: '18,900', status: 'Pending', time: '2:00 PM' }
  ];

  const todaysTransfers = [
    { id: 'TR-4525', from: 'Warehouse A', to: 'Warehouse B', items: 12, status: 'Dispatched', time: '08:00 AM' },
    { id: 'TR-4526', from: 'Warehouse B', to: 'Warehouse C', items: 5, status: 'In Transit', time: '10:45 AM' },
    { id: 'TR-4527', from: 'Warehouse C', to: 'Warehouse A', items: 18, status: 'Received', time: '1:30 PM' }
  ];

  const pendingApprovals = [
    { type: 'Stock Adjustment', id: 'ADJ-245', warehouse: 'Warehouse A', items: 3, reason: 'Damage', requestedBy: 'Staff John', priority: 'High' },
    { type: 'Transfer Request', id: 'TR-4528', from: 'Warehouse B', to: 'Warehouse A', items: 15, requestedBy: 'Manager Sarah', priority: 'Medium' },
    { type: 'Stock Adjustment', id: 'ADJ-246', warehouse: 'Warehouse C', items: 1, reason: 'Expired', requestedBy: 'Staff Mike', priority: 'Low' },
    { type: 'Transfer Request', id: 'TR-4529', from: 'Warehouse A', to: 'Warehouse C', items: 8, requestedBy: 'Staff Emma', priority: 'High' }
  ];

  const stockVarianceAlerts = [
    { sku: 'WC-002-BL', name: 'Wireless Controller V2', warehouse: 'Warehouse A', expected: 150, actual: 147, variance: -3, severity: 'Warning' },
    { sku: 'HDMI-50', name: 'HDMI Cable 5m', warehouse: 'Warehouse B', expected: 200, actual: 195, variance: -5, severity: 'Critical' },
    { sku: 'MK-001', name: 'Mech Keyboard MK1', warehouse: 'Warehouse A', expected: 80, actual: 78, variance: -2, severity: 'Info' },
    { sku: 'GM-X7', name: 'Gaming Mouse X7', warehouse: 'Warehouse C', expected: 120, actual: 115, variance: -5, severity: 'Warning' }
  ];

  const expirySummary = [
    { category: 'Critical (< 7 days)', count: 8, value: '12,450', color: 'red' },
    { category: 'Warning (7-30 days)', count: 24, value: '28,900', color: 'orange' },
    { category: 'Monitor (30-60 days)', count: 45, value: '56,200', color: 'blue' }
  ];

  const warehouseUtilization = [
    { name: 'Warehouse A', location: 'New York', capacity: 10000, used: 8500, utilization: 85, status: 'High' },
    { name: 'Warehouse B', location: 'Los Angeles', capacity: 8000, used: 4800, utilization: 60, status: 'Optimal' },
    { name: 'Warehouse C', location: 'Chicago', capacity: 12000, used: 9600, utilization: 80, status: 'High' },
    { name: 'Warehouse D', location: 'Houston', capacity: 6000, used: 2100, utilization: 35, status: 'Low' }
  ];

  // Admin dashboard (default for ADMIN role and fallback)
  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Today's GRNs & Transfers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's GRNs */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Today's GRNs</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Goods Receipt Notes</p>
              </div>
              <span className="bg-blue-50 dark:bg-blue-900/30 text-primary px-3 py-1 rounded-full text-sm font-bold">
                {todaysGRNs.length} Total
              </span>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {todaysGRNs.map((grn) => (
                <div key={grn.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-primary">{grn.id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">PO: {grn.poNumber}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      grn.status === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : grn.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {grn.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{grn.supplier}</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{grn.value}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>{grn.items} items</span>
                    <span>{grn.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Transfers */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Today's Transfers</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Warehouse Transfers</p>
              </div>
              <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-bold">
                {todaysTransfers.length} Total
              </span>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {todaysTransfers.map((transfer) => (
                <div key={transfer.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-primary">{transfer.id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transfer.from} → {transfer.to}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transfer.status === 'Received'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : transfer.status === 'In Transit'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {transfer.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{transfer.items} items</span>
                    <span>{transfer.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Pending Approvals</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {pendingApprovals.filter(a => a.priority === 'High').length} high priority items
              </p>
            </div>
            <button className="text-sm text-primary font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">Requested By</th>
                  <th className="px-5 py-3 text-center">Priority</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {pendingApprovals.map((approval, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4 font-medium">{approval.type}</td>
                    <td className="px-5 py-4 text-primary font-mono text-xs">{approval.id}</td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400 text-xs">
                      {approval.type === 'Stock Adjustment' 
                        ? `${approval.warehouse} - ${approval.reason} (${approval.items} items)`
                        : `${approval.from} → ${approval.to} (${approval.items} items)`
                      }
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{approval.requestedBy}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        approval.priority === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : approval.priority === 'Medium'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {approval.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="text-xs font-bold text-green-600 hover:text-green-700 dark:text-green-400">
                          Approve
                        </button>
                        <button className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Variance Alerts & Expiry Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Variance Alerts */}
          <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold">Stock Variance Alerts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discrepancies between expected and actual stock</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">SKU</th>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Warehouse</th>
                    <th className="px-5 py-3 text-center">Expected</th>
                    <th className="px-5 py-3 text-center">Actual</th>
                    <th className="px-5 py-3 text-center">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stockVarianceAlerts.map((alert, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">{alert.sku}</td>
                      <td className="px-5 py-4 font-medium">{alert.name}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400 text-xs">{alert.warehouse}</td>
                      <td className="px-5 py-4 text-center">{alert.expected}</td>
                      <td className="px-5 py-4 text-center font-bold">{alert.actual}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.severity === 'Critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : alert.severity === 'Warning'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {alert.variance > 0 ? '+' : ''}{alert.variance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expiry Summary */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold">Expiry Summary</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Items by expiration window</p>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {expirySummary.map((summary, index) => (
                <div key={index} className={`border-l-4 border-${summary.color}-500 bg-${summary.color}-50 dark:bg-${summary.color}-900/20 rounded-r-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold text-${summary.color}-800 dark:text-${summary.color}-400`}>
                      {summary.category}
                    </span>
                    <span className={`text-lg font-bold text-${summary.color}-600 dark:text-${summary.color}-400`}>
                      {summary.count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Total Value: <span className="font-bold">{summary.value}</span>
                  </p>
                </div>
              ))}
              <button className="mt-2 w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded transition-colors text-sm">
                View All Expiring Items
              </button>
            </div>
          </div>
        </div>

        {/* Warehouse Utilization */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold">Warehouse Utilization</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bin capacity utilization across all warehouses</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {warehouseUtilization.map((warehouse, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold">{warehouse.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{warehouse.location}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      warehouse.status === 'High'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : warehouse.status === 'Optimal'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {warehouse.status}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>{warehouse.used.toLocaleString()} / {warehouse.capacity.toLocaleString()}</span>
                      <span className="font-bold">{warehouse.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          warehouse.utilization >= 80
                            ? 'bg-red-500'
                            : warehouse.utilization >= 50
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${warehouse.utilization}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
