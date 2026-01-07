import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';

// Auth Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
import InventoryList from './pages/Dashboard/InventoryList';
import BatchTracking from './pages/Dashboard/BatchTracking';
import Orders from './pages/Dashboard/Orders';
import Customers from './pages/Dashboard/Customers';
import Dispatch from './pages/Dashboard/Dispatch';
import ProductDetails from './pages/Dashboard/ProductDetails';
import Reports from './pages/Dashboard/Reports';
import Suppliers from './pages/Dashboard/Suppliers';
import UserManagement from './pages/Dashboard/UserManagement';
import Settings from './pages/Dashboard/Settings';
import MyProfile from './pages/Dashboard/MyProfile';
import HelpSupport from './pages/Dashboard/HelpSupport';
import SKUManagement from './pages/Dashboard/SKUManagement';
import WarehouseManagement from './pages/Dashboard/WarehouseManagement';
import PurchaseRequisitions from './pages/Dashboard/PurchaseRequisitions';
import PurchaseOrders from './pages/Dashboard/PurchaseOrders';
import WarehouseTransfers from './pages/Dashboard/WarehouseTransfers';
import GoodsReceipt from './pages/Dashboard/GoodsReceipt';
import Putaway from './pages/Dashboard/Putaway';
import MyActivity from './pages/Dashboard/MyActivity';
import ReorderSuggestions from './pages/Dashboard/ReorderSuggestions';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/inventory" element={<ProtectedRoute><InventoryList /></ProtectedRoute>} />
        <Route path="/dashboard/skus" element={<ProtectedRoute><SKUManagement /></ProtectedRoute>} />
        <Route path="/dashboard/batch-tracking" element={<ProtectedRoute><BatchTracking /></ProtectedRoute>} />
        <Route path="/dashboard/warehouses" element={<ProtectedRoute><WarehouseManagement /></ProtectedRoute>} />
        <Route path="/dashboard/purchase-requisitions" element={<ProtectedRoute><PurchaseRequisitions /></ProtectedRoute>} />
        <Route path="/dashboard/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
        <Route path="/dashboard/transfers" element={<ProtectedRoute><WarehouseTransfers /></ProtectedRoute>} />
        <Route path="/dashboard/inbound-receipts" element={<ProtectedRoute><GoodsReceipt /></ProtectedRoute>} />
        <Route path="/dashboard/putaway" element={<ProtectedRoute><Putaway /></ProtectedRoute>} />
        <Route path="/dashboard/my-activity" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />
        <Route path="/dashboard/reorder-suggestions" element={<ProtectedRoute><ReorderSuggestions /></ProtectedRoute>} />
        <Route path="/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/dashboard/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/dashboard/outbound-dispatch" element={<ProtectedRoute><Dispatch /></ProtectedRoute>} />
        <Route path="/dashboard/product-details" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
        <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/dashboard/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
        <Route path="/dashboard/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />        <Route path="/dashboard/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />        <Route path="/dashboard/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
