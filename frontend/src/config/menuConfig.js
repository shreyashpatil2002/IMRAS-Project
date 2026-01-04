// Centralized Menu Configuration by Role

export const menuConfig = {
  WAREHOUSE_STAFF: {
    label: 'Warehouse Staff',
    sections: [
      {
        title: 'Dashboard',
        items: [
          {
            path: '/dashboard',
            label: 'Dashboard',
            icon: 'dashboard'
          }
        ]
      },
      {
        title: 'Warehouse Operations',
        items: [
          {
            path: '/dashboard/inbound-receipts',
            label: 'Inbound Receipts',
            icon: 'local_shipping'
          },
          {
            path: '/dashboard/outbound-dispatch',
            label: 'Outbound Dispatch',
            icon: 'outbox'
          },
          {
            path: '/dashboard/putaway',
            label: 'Putaway',
            icon: 'move_to_inbox'
          },
          {
            path: '/dashboard/inventory',
            label: 'Inventory Lookup',
            icon: 'search'
          },
          {
            path: '/dashboard/transfers',
            label: 'Transfer Request',
            icon: 'swap_horiz'
          }
        ]
      },
      {
        title: 'Activity',
        items: [
          {
            path: '/dashboard/my-activity',
            label: 'My Activity',
            icon: 'history'
          }
        ]
      }
    ]
  },
  
  INVENTORY_MANAGER: {
    label: 'Inventory Manager',
    sections: [
      {
        title: 'Dashboard',
        items: [
          {
            path: '/dashboard',
            label: 'Dashboard',
            icon: 'dashboard'
          }
        ]
      },
      {
        title: 'Inventory Management',
        items: [
          {
            path: '/dashboard/inventory',
            label: 'Inventory Overview',
            icon: 'inventory_2'
          },
          {
            path: '/dashboard/skus',
            label: 'SKU Management',
            icon: 'inventory'
          },
          {
            path: '/dashboard/batch-tracking',
            label: 'Batch Tracking',
            icon: 'qr_code_2'
          }
        ]
      },
      {
        title: 'Procurement',
        items: [
          {
            path: '/dashboard/purchase-requisitions',
            label: 'PR Approval',
            icon: 'assignment'
          },
          {
            path: '/dashboard/reorder-suggestions',
            label: 'Auto Reorder',
            icon: 'notification_important'
          },
          {
            path: '/dashboard/suppliers',
            label: 'Suppliers',
            icon: 'storefront'
          }
        ]
      },
      {
        title: 'Sales & Orders',
        items: [
          {
            path: '/dashboard/orders',
            label: 'Sales Orders',
            icon: 'shopping_cart'
          }
        ]
      },
      {
        title: 'Oversight',
        items: [
          {
            path: '/dashboard/transfers',
            label: 'Transfer Oversight',
            icon: 'visibility'
          }
        ]
      }
    ]
  },
  
  ADMIN: {
    label: 'Administrator',
    sections: [
      {
        title: 'Dashboard',
        items: [
          {
            path: '/dashboard',
            label: 'Dashboard',
            icon: 'dashboard'
          }
        ]
      },
      {
        title: 'Inventory Management',
        items: [
          {
            path: '/dashboard/inventory',
            label: 'Inventory Overview',
            icon: 'inventory_2'
          },
          {
            path: '/dashboard/skus',
            label: 'SKU Management',
            icon: 'inventory'
          },
          {
            path: '/dashboard/batch-tracking',
            label: 'Batch Tracking',
            icon: 'qr_code_2'
          }
        ]
      },
      {
        title: 'Procurement',
        items: [
          {
            path: '/dashboard/purchase-orders',
            label: 'Purchase Orders',
            icon: 'receipt_long'
          },
          {
            path: '/dashboard/purchase-requisitions',
            label: 'Purchase Requisitions',
            icon: 'assignment'
          },
          {
            path: '/dashboard/suppliers',
            label: 'Suppliers',
            icon: 'storefront'
          }
        ]
      },
      {
        title: 'Sales & Orders',
        items: [
          {
            path: '/dashboard/orders',
            label: 'Sales Orders',
            icon: 'shopping_cart'
          },
          {
            path: '/dashboard/customers',
            label: 'Customers',
            icon: 'people'
          }
        ]
      },
      {
        title: 'Warehouse Management',
        items: [
          {
            path: '/dashboard/warehouses',
            label: 'Warehouses & Locations',
            icon: 'warehouse'
          },
          {
            path: '/dashboard/transfers',
            label: 'Transfer Approvals',
            icon: 'swap_horiz'
          }
        ]
      },
      {
        title: 'System Administration',
        items: [
          {
            path: '/dashboard/users',
            label: 'User & Role Management',
            icon: 'manage_accounts'
          },
          {
            path: '/dashboard/reports',
            label: 'Reports & Analytics',
            icon: 'bar_chart'
          },
          {
            path: '/dashboard/settings',
            label: 'System Settings',
            icon: 'settings'
          }
        ]
      }
    ]
  }
};

// Helper function to get menu items for a specific role
export const getMenuForRole = (role) => {
  // Handle both old and new role formats
  const roleMapping = {
    'Admin': 'ADMIN',
    'Manager': 'INVENTORY_MANAGER',
    'Staff': 'WAREHOUSE_STAFF'
  };
  
  // Normalize the role
  const normalizedRole = roleMapping[role] || role;
  
  console.log('Original role:', role);
  console.log('Normalized role:', normalizedRole);
  console.log('Menu found:', menuConfig[normalizedRole] ? 'Yes' : 'No');
  
  return menuConfig[normalizedRole] || menuConfig.WAREHOUSE_STAFF;
};

// Helper function to check if a user can access a specific path
export const canAccessPath = (role, path) => {
  const menu = menuConfig[role];
  if (!menu) return false;
  
  for (const section of menu.sections) {
    for (const item of section.items) {
      if (item.path === path) return true;
    }
  }
  return false;
};
