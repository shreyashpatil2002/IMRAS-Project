# IMRAS - Inventory Management & Reorder Automation System

A comprehensive full-stack inventory management system with automated reorder suggestions, multi-warehouse support, and real-time stock tracking.

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18.2-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-6+-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Key Features

### 📦 Inventory Management
- **Multi-warehouse support** with location tracking (aisle-rack-bin)
- **SKU management** with categories and detailed tracking
- **Batch/Lot tracking** with expiry date monitoring
- **Real-time stock levels** across all warehouses
- **Stock ledger** with complete transaction history
- **Automated reorder suggestions** based on stock levels

### 🛒 Purchase Management
- **Purchase Requisitions (PR)** with approval workflow
- **Purchase Orders (PO)** with supplier tracking
- **Goods receipt** processing and putaway
- **Supplier performance** metrics and reporting
- **Automated PR creation** from reorder suggestions

### 📤 Order Management
- **Customer order** creation and tracking
- **Multi-status workflow** (Pending → Reserved → Picked → Dispatched → Delivered)
- **Stock reservation** on order confirmation
- **Order fulfillment** statistics and reporting

### 🔄 Warehouse Operations
- **Inter-warehouse transfers** with tracking
- **Stock adjustments** with reason codes
- **Location-based inventory** management
- **Activity tracking** per user

### 📊 Analytics & Reporting
- **ABC Analysis** - Categorize inventory by value
- **Stock Ageing Report** - Track expiry dates
- **Inventory Turnover** - Monitor stock rotation
- **Stock Valuation** - Current inventory value
- **Supplier Performance** - Delivery metrics
- **Order Fulfillment** - Success rates
- **CSV Export** functionality

### 👥 User Management
- **Role-based access control** (Admin, Inventory Manager, Warehouse Worker)
- **User registration** with email verification
- **Password reset** functionality
- **Activity tracking** per user
- **Profile management**

### 🎨 UI/UX
- **Modern React interface** with TailwindCSS
- **Dark mode support** with smooth transitions
- **Responsive design** for mobile and tablet
- **Loading states** on all actions
- **Real-time updates** and notifications

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
│   │   ├── controllers/     # Business logic (12 controllers)
│   │   ├── middleware/      # Auth, validation, rate limiting, security
│   │   ├── models/          # Mongoose schemas (11 models)
│   │   ├── routes/          # API endpoints (12 routes)
│   │   ├── services/        # Business services (stock, reorder, reports)
│   │   ├── utils/           # Helper functions (JWT)
│   │   └── server.js        # Entry point
│   ├── .env.example         # Environment template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components (Layout, Header, Sidebar)
    │   ├── contexts/        # React contexts (Auth)
    │   ├── pages/           # Page components (Login, Dashboard, etc.)
    │   │   └── Dashboard/   # 25+ Dashboard pages
    │   ├── services/        # API service layer (12 services)
    │   ├── config/          # Menu configuration
    │   ├── App.jsx
    │   └── index.js
    ├── .env                 # API configuration
    └── package.json
```

## 🔒 Security Features

- ✅ **JWT Authentication** with secure token generation
- ✅ **Bcrypt Password Hashing** (10 rounds)
- ✅ **Rate Limiting** on API endpoints (100 req/15min general, 5 req/15min auth)
- ✅ **Input Sanitization** to prevent XSS attacks
- ✅ **NoSQL Injection Prevention** with parameter validation
- ✅ **Security Headers** (X-Frame-Options, CSP, XSS-Protection)
- ✅ **CORS Configuration** for trusted origins
- ✅ **Role-Based Access Control** (RBAC)
- ✅ **Protected Routes** with middleware
- ✅ **Request Size Limits** (10MB max)

## 🔗 API Endpoints

See [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for complete API reference.

### Quick Reference

### Quick Reference

**Authentication:** `/api/auth/*` - Register, Login, Password Reset  
**Users:** `/api/users/*` - User management  
**Products:** `/api/products/*` - Product and SKU management  
**Batches:** `/api/batches/*` - Batch tracking  
**Orders:** `/api/orders/*` - Customer orders  
**Purchase Requisitions:** `/api/pr/*` - PR workflow  
**Purchase Orders:** `/api/po/*` - PO management  
**Warehouses:** `/api/warehouses/*` - Warehouse operations  
**Transfers:** `/api/transfers/*` - Inter-warehouse transfers  
**Suppliers:** `/api/suppliers/*` - Supplier management  
**Reorder:** `/api/reorder/*` - Reorder suggestions and reports  
**Stock Ledger:** `/api/stock-ledger/*` - Transaction history and activity

## 📚 Documentation

- [API Documentation](backend/API_DOCUMENTATION.md) - Complete API reference
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Security Policy](SECURITY.md) - Security guidelines and reporting
- [Contributing](CONTRIBUTING.md) - How to contribute to the project
- [Frontend Implementation](FRONTEND_IMPLEMENTATION.md) - Frontend architecture

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcryptjs, rate limiting, input sanitization
- **Email:** Nodemailer
- **Validation:** express-validator
- **HTTP Client:** Axios

### Frontend
- **Library:** React 18.2
- **Routing:** React Router v6
- **Styling:** TailwindCSS 3.4
- **Icons:** Material Symbols
- **HTTP Client:** Axios
- **State Management:** React Context API

### Development Tools
- **Backend Dev Server:** Nodemon
- **Frontend Dev Server:** React Scripts (Create React App)
- **API Testing:** Available via health check endpoint

## � Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions including:
- MongoDB Atlas setup
- Backend deployment (Heroku, DigitalOcean, AWS, Railway)
- Frontend deployment (Vercel, Netlify)
- Environment configuration
- Security best practices
- SSL/HTTPS setup
- Production optimization

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- Development guidelines
- Pull request process
- Coding standards

## 🔐 Security

- Security issues should be reported via email (see [SECURITY.md](SECURITY.md))
- Do not open public issues for security vulnerabilities
- JWT secrets and database credentials must be kept secure
- Regular security audits recommended

## 📝 Notes

- All API requests require authentication except login/register/password-reset
- JWT token is stored in localStorage
- Token is automatically added to request headers via Axios interceptor
- Unauthorized requests (401) redirect to login
- Role-based permissions enforced on both frontend and backend
- Rate limiting active on all routes (100 req/15min general, 5 req/15min auth)

## 🎯 Future Enhancements

Potential features for future releases:
- [ ] Barcode/QR code scanning integration
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboards with charts
- [ ] Real-time notifications with WebSocket
- [ ] Image upload for products
- [ ] PDF report generation
- [ ] Multi-language support (i18n)
- [ ] Audit trail for all changes
- [ ] Advanced search with Elasticsearch
- [ ] Integration with accounting systems
- [ ] Predictive analytics for reorder suggestions

## 📊 Project Status

**Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** January 2026

### What's Included
✅ Complete inventory management  
✅ Purchase requisition & order workflow  
✅ Multi-warehouse operations  
✅ Automated reorder suggestions  
✅ Comprehensive reporting  
✅ Role-based access control  
✅ Security features (rate limiting, input sanitization)  
✅ Dark mode support  
✅ Mobile responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Initial development - IMRAS Team

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database
- TailwindCSS for the utility-first CSS framework
- All open-source contributors

## 📧 Contact & Support

- Create an issue for bug reports
- Star ⭐ the repository if you find it useful
- Fork and contribute to make it better

---

**Made with ❤️ for efficient inventory management**
