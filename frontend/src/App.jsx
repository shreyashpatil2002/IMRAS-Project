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

// Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
import AddProduct from './pages/Dashboard/AddProduct';
import InventoryList from './pages/Dashboard/InventoryList';
import BatchTracking from './pages/Dashboard/BatchTracking';
import Orders from './pages/Dashboard/Orders';
import ProductDetails from './pages/Dashboard/ProductDetails';
import Reports from './pages/Dashboard/Reports';
import Suppliers from './pages/Dashboard/Suppliers';
import UserManagement from './pages/Dashboard/UserManagement';
import Settings from './pages/Dashboard/Settings';
import HelpSupport from './pages/Dashboard/HelpSupport';

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
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/inventory" element={<ProtectedRoute><InventoryList /></ProtectedRoute>} />
        <Route path="/dashboard/batch-tracking" element={<ProtectedRoute><BatchTracking /></ProtectedRoute>} />
        <Route path="/dashboard/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/dashboard/product-details" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
        <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/dashboard/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
        <Route path="/dashboard/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/dashboard/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
