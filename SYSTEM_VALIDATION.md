# IMRAS System Validation & Coordination Check

## Overview
This document outlines the validated system flows and confirms backend-frontend coordination.

---

## ✅ Order Management Flow

### 1. Order Creation (Sales Orders)
**Frontend:** [Orders.jsx](frontend/src/pages/Dashboard/Orders.jsx)
**Backend:** [orderController.js](backend/src/controllers/orderController.js) - `createOrder()`
**Route:** `POST /api/orders`

**Process:**
1. User creates order with customer, warehouse, SKU, batch, quantity, shipping details
2. **For ADMIN:** Can select any warehouse
3. **For INVENTORY_MANAGER:** Warehouse auto-selected from `assignedWarehouse`
4. Backend validates:
   - Customer exists
   - Warehouse exists
   - SKU exists
   - Batch has sufficient quantity (validation only, no deduction yet)
5. Order created with status: **CONFIRMED** (changed from PENDING)
6. Customer `totalOrders` incremented
7. **Stock is NOT deducted yet** - message: "Stock will be deducted when dispatched"

**Coordination Status:** ✅ Working correctly
- Frontend sends proper order data structure
- Backend validates without deducting stock
- Warehouse field conditionally rendered based on user role

---

### 2. Order Dispatch Workflow (Warehouse Staff)
**Frontend:** [Dispatch.jsx](frontend/src/pages/Dashboard/Dispatch.jsx)
**Backend:** [orderController.js](backend/src/controllers/orderController.js) - `updateOrderStatus()`
**Route:** `PATCH /api/orders/:id/status`

**Status Progression:**
```
CONFIRMED → PICKING → PICKED → PACKED → SHIPPED → DELIVERED
           ↓
        CANCELLED (only before SHIPPED)
```

**Process:**

#### Status: CONFIRMED
- Initial status after order creation
- Appears in Dispatch page for warehouse staff
- Action: "Start Picking"

#### Status: PICKING
- Warehouse staff started picking items
- Action: "Complete Picking"

#### Status: PICKED
- Items picked from shelves
- No batch deduction (batches already allocated at order creation)
- Records `pickedDate` and `pickedBy`
- Action: "Mark as Packed"

#### Status: PACKED
- Items packed and ready to ship
- Records `packedDate` and `packedBy`
- Action: "Ship Order"

#### Status: SHIPPED ⚠️ **CRITICAL - STOCK DEDUCTION HAPPENS HERE**
- **For each order item with batch:**
  - Validates batch still has sufficient quantity
  - Deducts `item.quantity` from `batch.currentQuantity`
  - Creates OUTWARD stock ledger entry via `stockService.recordMovement()`
  - Includes batch number, expiry date, location
- Records `shippedDate` and `shippedBy`
- Updates customer `totalRevenue` += order.totalAmount
- Confirmation message: "Ship this order? Stock will be deducted from inventory."

#### Status: DELIVERED
- Final successful status
- Records `deliveredDate`

#### Status: CANCELLED
- Can only cancel orders before SHIPPED
- If trying to cancel SHIPPED or DELIVERED order: Error returned
- No stock return needed (stock never deducted until SHIPPED)

**Coordination Status:** ✅ Working correctly
- Frontend shows appropriate action buttons per status
- Backend handles each status transition properly
- Stock deduction only happens at SHIPPED status
- Clear error messages for insufficient stock

---

### 3. Stock Management Integration

**Stock Deduction Points:**
1. ❌ Order Creation - Stock validated but NOT deducted
2. ❌ PICKING status - No deduction
3. ❌ PICKED status - No deduction
4. ❌ PACKED status - No deduction
5. ✅ **SHIPPED status** - Stock deducted and ledger entry created

**Stock Ledger Entry (SHIPPED):**
- Movement Type: `OUTWARD`
- References: Order ID, Batch Number, Expiry Date, Location
- Uses: `stockService.recordMovement()` for consistency
- User: Warehouse staff who shipped the order

**Coordination Status:** ✅ Working correctly
- Stock remains available in inventory until actually shipped
- Proper OUTWARD ledger entries created
- Balance quantities updated correctly

---

## ✅ Role-Based Access Control

### ADMIN
**Menu Items:**
- Sales Orders
- Customers
- All other features

**Order Creation:**
- Can select any warehouse from dropdown
- Full access to all orders

### INVENTORY_MANAGER
**Menu Items:**
- Sales Orders
- Inventory features
- NO Customers menu

**Order Creation:**
- Warehouse auto-selected from `assignedWarehouse`
- Warehouse shown as read-only text (no dropdown)
- Can only see orders from assigned warehouse

### WAREHOUSE_STAFF
**Menu Items:**
- Outbound Dispatch
- Inbound Receipts
- Warehouse operations

**Dispatch Page:**
- Only sees orders from assigned warehouse
- Can progress orders through statuses
- Performs actual stock deduction when shipping

**Coordination Status:** ✅ Working correctly
- Menu config updated with correct paths
- Warehouse auto-selection working
- Role-based filtering implemented

---

## ✅ Path Mapping

### Frontend Routes
- `/dashboard/orders` → Orders.jsx (Sales Orders)
- `/dashboard/customers` → Customers.jsx
- `/dashboard/outbound-dispatch` → Dispatch.jsx
- `/dashboard/inbound-receipts` → GoodsReceipt.jsx

### Backend Routes
- `POST /api/orders` → Create order
- `GET /api/orders` → List orders (filtered by role/warehouse)
- `PATCH /api/orders/:id/status` → Update order status
- `GET /api/orders/:id` → Get order details

**Coordination Status:** ✅ All paths correctly mapped

---

## ⚠️ Known Limitations

### 1. Stock Reservation
**Issue:** Stock validated at order creation but not reserved. If multiple orders use same batch between creation and shipping, later orders may fail to ship due to insufficient stock.

**Current Handling:**
- Error message: "Insufficient stock in batch X. Available: Y, Required: Z"
- Suggests canceling and recreating order with available batches

**Future Enhancement:** Implement soft-lock/reservation system

### 2. Batch Availability Window
**Issue:** Time gap between order creation and shipping allows stock to be consumed by other orders.

**Current Solution:**
- Real-time validation at SHIPPED status
- Clear error messages
- Failed shipments can be cancelled and recreated

---

## ✅ Validated Scenarios

### Scenario 1: Happy Path - Complete Order Flow
1. ✅ Manager creates order with batch selection
2. ✅ Order appears in Dispatch page with CONFIRMED status
3. ✅ Warehouse staff progresses: PICKING → PICKED → PACKED
4. ✅ Warehouse staff ships order
5. ✅ Stock deducted from batch
6. ✅ OUTWARD ledger entry created
7. ✅ Customer revenue updated

### Scenario 2: Insufficient Stock at Shipping
1. ✅ Order created successfully (stock available)
2. ✅ Another order ships using same batch
3. ✅ First order tries to ship
4. ✅ Error returned with clear message
5. ✅ Order remains in PACKED status
6. ✅ Can be cancelled and recreated

### Scenario 3: Cancel Order
1. ✅ Order in CONFIRMED/PICKING/PICKED/PACKED status
2. ✅ Cancel button clicked
3. ✅ Order cancelled successfully
4. ✅ No stock return needed (never deducted)

### Scenario 4: Try to Cancel Shipped Order
1. ✅ Order already SHIPPED
2. ✅ Cancel attempt returns error
3. ✅ Cannot cancel shipped orders

### Scenario 5: Role-Based Access
1. ✅ Admin sees all orders, all warehouses
2. ✅ Manager sees orders from assigned warehouse only
3. ✅ Manager's warehouse auto-selected in form
4. ✅ Warehouse staff sees only dispatch interface

---

## 🔍 Coordination Checklist

| Component | Status | Notes |
|-----------|--------|-------|
| Order Creation API | ✅ | Validates without deducting stock |
| Order Status Update API | ✅ | Handles all status transitions |
| Stock Deduction Logic | ✅ | Only at SHIPPED status |
| Stock Ledger Integration | ✅ | Uses stockService.recordMovement() |
| Frontend Order Form | ✅ | Sends proper data structure |
| Frontend Dispatch Page | ✅ | Status buttons work correctly |
| Warehouse Auto-Select | ✅ | Working for non-admin users |
| Role-Based Menus | ✅ | Correct items per role |
| Error Handling | ✅ | Clear messages for all errors |
| Cancel Order Logic | ✅ | Prevents canceling shipped orders |
| Customer Stats Update | ✅ | totalOrders and totalRevenue |

---

## 🎯 System Status: OPERATIONAL

All core functionalities are working correctly with proper backend-frontend coordination. The system follows a logical workflow where:
1. Orders are created with validated stock
2. Warehouse staff progresses orders through picking/packing
3. Stock is only deducted when order is actually shipped
4. Proper error handling for edge cases
5. Role-based access controls enforced

**Last Validated:** January 3, 2026
