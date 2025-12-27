# IMRAS - Inventory Management System

Full-stack inventory management system with React frontend and Node.js/Express/MongoDB backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Update MongoDB connection string if needed
- Set JWT_SECRET to a secure random string

4. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured to connect to `http://localhost:5000/api`

4. Start the frontend:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## ✨ Features Implemented

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Manager, Staff)
- ✅ Protected routes
- ✅ Login/Register/Logout functionality

### User Management
- ✅ View all users
- ✅ Add new users with role assignment
- ✅ Delete users
- ✅ Real-time data from backend

### Inventory Management
- ✅ View all products with search and filters
- ✅ Product statistics dashboard
- ✅ Add/Edit/Delete products
- ✅ Stock level tracking
- ✅ Category and status filters

### Batch/Lot Tracking
- ✅ View all batches with detailed information
- ✅ Batch statistics (Active, Low Stock, Expiring Soon, Depleted)
- ✅ Adjust batch quantities
- ✅ Track expiry dates
- ✅ QR code support

### Order Management
- ✅ View all orders
- ✅ Create new orders
- ✅ Update order status
- ✅ Track order lifecycle (Pending → Processing → Shipped → Delivered)
- ✅ Automatic inventory deduction

### Supplier Management
- ✅ View all suppliers
- ✅ Add/Edit/Delete suppliers
- ✅ Supplier contact information
- ✅ Category-based organization

## 🔐 Default Test Account

After starting the backend, you can register a new account or create one via API:

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@imras.com",
  "password": "admin123",
  "role": "Admin"
}
```

## 📁 Project Structure

```
IMRAS/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth & validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API endpoints
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Entry point
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   │   └── Dashboard/   # Dashboard pages
    │   ├── services/        # API service layer
    │   ├── App.jsx
    │   └── index.js
    ├── .env
    └── package.json
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/stats/overview` - Get statistics
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Batches
- `GET /api/batches` - Get all batches
- `GET /api/batches/stats/overview` - Get statistics
- `POST /api/batches` - Create batch
- `PATCH /api/batches/:id/adjust` - Adjust quantity
- `DELETE /api/batches/:id` - Delete batch

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/stats/overview` - Get statistics
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update status
- `DELETE /api/orders/:id` - Delete order

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

## 🛠️ Technologies Used

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Express Validator

### Frontend
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Material Symbols icons

## 📝 Notes

- All API requests require authentication except login/register
- JWT token is stored in localStorage
- Token is automatically added to request headers
- Unauthorized requests (401) redirect to login
- Role-based permissions enforced on both frontend and backend

## 🎯 Next Steps

To further enhance the system, consider:
- Email verification for new users
- Password reset via email
- Image upload for products
- Advanced reporting and analytics
- Export functionality (CSV, PDF)
- Real-time notifications
- Barcode/QR code scanning
- Multi-warehouse support

## 📄 License

ISC
