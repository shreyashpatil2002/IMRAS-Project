# IMRAS Backend API

Backend API for IMRAS Inventory Management System built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 User Management (Admin, Manager, Staff roles)
- 📦 Product Inventory Management
- 🏷️ Batch/Lot Tracking
- 📋 Order Management
- 🏭 Supplier Management
- 📊 Statistics & Analytics
- 🔍 Search & Filter Capabilities

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/imras
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password

### Users
- `GET /api/users` - Get all users (Admin, Manager)
- `GET /api/users/:id` - Get single user (Admin, Manager)
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin, Manager)
- `PUT /api/products/:id` - Update product (Admin, Manager)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/stats/overview` - Get product statistics

### Batches
- `GET /api/batches` - Get all batches
- `GET /api/batches/:id` - Get single batch
- `POST /api/batches` - Create batch (Admin, Manager)
- `PUT /api/batches/:id` - Update batch (Admin, Manager)
- `PATCH /api/batches/:id/adjust` - Adjust batch quantity (Admin, Manager)
- `DELETE /api/batches/:id` - Delete batch (Admin)
- `GET /api/batches/stats/overview` - Get batch statistics

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order (Admin, Manager)
- `PATCH /api/orders/:id/status` - Update order status (Admin, Manager)
- `DELETE /api/orders/:id` - Delete order (Admin)
- `GET /api/orders/stats/overview` - Get order statistics

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier (Admin, Manager)
- `PUT /api/suppliers/:id` - Update supplier (Admin, Manager)
- `DELETE /api/suppliers/:id` - Delete supplier (Admin)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## User Roles

- **Admin** - Full access to all resources
- **Manager** - Can manage products, batches, orders, and suppliers
- **Staff** - Can view and create orders

## Error Handling

The API returns errors in the following format:
```json
{
  "status": "error",
  "message": "Error message here",
  "errors": [] // Optional validation errors
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── .env                 # Environment variables
├── .gitignore
└── package.json
```

## Models

### User
- name, email, password, role, status, lastLogin

### Product
- name, sku, category, description, image, unitCost, sellingPrice, quantity, reorderPoint, location, supplier, batchTrackingEnabled, status

### Batch
- batchNumber, product, initialQuantity, currentQuantity, receivedDate, expiryDate, location, supplier, qrCode, status, notes

### Order
- orderNumber, customer (name, email, phone, address), items, totalAmount, status, paymentStatus, shippingMethod, notes, orderDate, shippedDate, deliveredDate, createdBy

### Supplier
- name, email, phone, address, contact, category, status, rating, notes

## License

ISC
