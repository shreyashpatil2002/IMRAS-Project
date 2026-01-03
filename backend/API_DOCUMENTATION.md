# IMRAS Advanced API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## Role-Based Access Control
- **Admin**: Full access to all endpoints
- **Manager**: Approval workflows, reports, most operations
- **Staff**: Basic operations, no approval authority

---

## 1. SKU Management (`/api/skus`)

### Get All SKUs
```
GET /api/skus?category=RAW_MATERIAL&isActive=true&search=widget
```
**Roles**: All authenticated users

**Query Parameters**:
- `category`: Filter by category (RAW_MATERIAL, FINISHED_GOODS, WIP, CONSUMABLES, SPARE_PARTS)
- `isActive`: Filter by active status (true/false)
- `search`: Search in skuCode or name

**Response**:
```json
{
  "status": "success",
  "count": 10,
  "data": [
    {
      "_id": "...",
      "skuCode": "SKU001",
      "name": "Widget A",
      "category": "RAW_MATERIAL",
      "unit": "PCS",
      "minStock": 100,
      "maxStock": 1000,
      "safetyStock": 50,
      "leadTime": 7,
      "unitCost": 10.50,
      "sellingPrice": 15.00,
      "defaultWarehouse": {...},
      "supplier": {...},
      "isActive": true
    }
  ]
}
```

### Get SKU by ID
```
GET /api/skus/:id
```
**Roles**: All authenticated users

**Response**: Includes totalStock and warehouseStock breakdown

### Create SKU
```
POST /api/skus
```
**Roles**: Admin, Manager

**Body**:
```json
{
  "skuCode": "SKU001",
  "name": "Widget A",
  "category": "RAW_MATERIAL",
  "unit": "PCS",
  "minStock": 100,
  "maxStock": 1000,
  "safetyStock": 50,
  "defaultWarehouse": "warehouse_id",
  "defaultBin": "A1-01",
  "leadTime": 7,
  "unitCost": 10.50,
  "sellingPrice": 15.00,
  "supplier": "supplier_id",
  "description": "High quality widget"
}
```

### Update SKU
```
PUT /api/skus/:id
```
**Roles**: Admin, Manager

### Delete SKU (Soft Delete)
```
DELETE /api/skus/:id
```
**Roles**: Admin

### Get SKU Stock
```
GET /api/skus/:id/stock?warehouseId=warehouse_id
```
**Roles**: All authenticated users

**Response**:
```json
{
  "status": "success",
  "data": {
    "skuId": "...",
    "warehouseId": "...",
    "currentStock": 150,
    "minStock": 100,
    "safetyStock": 50,
    "needsReorder": false
  }
}
```

### Get SKU Stock History
```
GET /api/skus/:id/history?warehouseId=warehouse_id&limit=50
```
**Roles**: All authenticated users

---

## 2. Warehouse Management (`/api/warehouses`)

### Get All Warehouses
```
GET /api/warehouses?isActive=true
```
**Roles**: All authenticated users

### Get Warehouse by ID
```
GET /api/warehouses/:id
```
**Roles**: All authenticated users

### Create Warehouse
```
POST /api/warehouses
```
**Roles**: Admin

**Body**:
```json
{
  "code": "WH001",
  "name": "Main Warehouse",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "manager": "user_id",
  "capacity": 10000,
  "locations": [
    {
      "aisle": "A",
      "bin": "01",
      "capacity": 100,
      "isActive": true
    }
  ]
}
```

### Update Warehouse
```
PUT /api/warehouses/:id
```
**Roles**: Admin

### Delete Warehouse (Soft Delete)
```
DELETE /api/warehouses/:id
```
**Roles**: Admin

### Add Location to Warehouse
```
POST /api/warehouses/:id/locations
```
**Roles**: Admin, Manager

**Body**:
```json
{
  "aisle": "B",
  "bin": "05",
  "capacity": 150,
  "isActive": true
}
```

### Update Warehouse Location
```
PUT /api/warehouses/:id/locations/:locationId
```
**Roles**: Admin, Manager

---

## 3. Purchase Requisitions (`/api/purchase-requisitions`)

### Get All PRs
```
GET /api/purchase-requisitions?status=APPROVED&warehouse=warehouse_id
```
**Roles**: All authenticated users

**Query Parameters**:
- `status`: DRAFT, SUBMITTED, APPROVED, REJECTED, CONVERTED_TO_PO
- `warehouse`: Filter by warehouse ID

### Get PR by ID
```
GET /api/purchase-requisitions/:id
```
**Roles**: All authenticated users

### Create PR
```
POST /api/purchase-requisitions
```
**Roles**: Staff, Manager, Admin

**Body**:
```json
{
  "warehouse": "warehouse_id",
  "items": [
    {
      "sku": "sku_id",
      "requestedQuantity": 500,
      "urgency": "HIGH",
      "remarks": "Low stock alert"
    }
  ],
  "justification": "Stock below minimum level"
}
```

### Update PR (Draft Only)
```
PUT /api/purchase-requisitions/:id
```
**Roles**: Staff, Manager, Admin

### Submit PR
```
POST /api/purchase-requisitions/:id/submit
```
**Roles**: Staff, Manager, Admin

**Effect**: Changes status from DRAFT to SUBMITTED

### Approve PR
```
POST /api/purchase-requisitions/:id/approve
```
**Roles**: Manager, Admin

**Effect**: Changes status to APPROVED, sets approvedBy and approvalDate

### Reject PR
```
POST /api/purchase-requisitions/:id/reject
```
**Roles**: Manager, Admin

**Body**:
```json
{
  "rejectionReason": "Budget constraints"
}
```

### Convert PR to PO
```
POST /api/purchase-requisitions/:id/convert-to-po
```
**Roles**: Manager, Admin

**Effect**: Creates one or more POs (grouped by supplier) with pricing tiers applied

---

## 4. Purchase Orders (`/api/purchase-orders`)

### Get All POs
```
GET /api/purchase-orders?status=APPROVED&supplier=supplier_id&warehouse=warehouse_id
```
**Roles**: All authenticated users

### Get PO by ID
```
GET /api/purchase-orders/:id
```
**Roles**: All authenticated users

### Create PO
```
POST /api/purchase-orders
```
**Roles**: Manager, Admin

**Body**:
```json
{
  "requisition": "pr_id",
  "supplier": "supplier_id",
  "warehouse": "warehouse_id",
  "items": [
    {
      "sku": "sku_id",
      "orderedQuantity": 500,
      "unitPrice": 9.50
    }
  ],
  "expectedDeliveryDate": "2025-01-15",
  "paymentTerms": "Net 30",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "notes": "Urgent order"
}
```

### Update PO (Created Status Only)
```
PUT /api/purchase-orders/:id
```
**Roles**: Manager, Admin

### Approve PO
```
POST /api/purchase-orders/:id/approve
```
**Roles**: Admin

**Effect**: Changes status to APPROVED, sets approvedBy and approvalDate

### Send PO to Supplier
```
POST /api/purchase-orders/:id/send
```
**Roles**: Admin, Manager

**Effect**: Changes status to SENT, sets sentDate
**TODO**: Email integration with Nodemailer

### Receive PO Items
```
POST /api/purchase-orders/:id/receive
```
**Roles**: Staff, Manager, Admin

**Body**:
```json
{
  "items": [
    {
      "sku": "sku_id",
      "receivedQuantity": 450,
      "batchNumber": "BATCH001",
      "expiryDate": "2026-12-31",
      "location": {
        "aisle": "A",
        "bin": "01"
      }
    }
  ]
}
```

**Effect**: 
- Creates INWARD stock ledger entries
- Updates receivedQuantity in PO
- Changes status to PARTIALLY_RECEIVED or RECEIVED
- Sets actualDeliveryDate when fully received

### Cancel PO
```
POST /api/purchase-orders/:id/cancel
```
**Roles**: Admin

**Body**:
```json
{
  "reason": "Supplier cannot fulfill"
}
```

### Close PO
```
POST /api/purchase-orders/:id/close
```
**Roles**: Admin, Manager

**Effect**: Marks PO as completed

---

## 5. Warehouse Transfers (`/api/transfers`)

### Get All Transfers
```
GET /api/transfers?status=IN_TRANSIT&sourceWarehouse=wh_id&destinationWarehouse=wh_id
```
**Roles**: All authenticated users

### Get Transfer by ID
```
GET /api/transfers/:id
```
**Roles**: All authenticated users

### Create Transfer Request
```
POST /api/transfers
```
**Roles**: Staff, Manager, Admin

**Body**:
```json
{
  "sourceWarehouse": "warehouse_id",
  "destinationWarehouse": "warehouse_id",
  "items": [
    {
      "sku": "sku_id",
      "quantity": 100,
      "batchNumber": "BATCH001",
      "expiryDate": "2026-12-31"
    }
  ],
  "notes": "Inter-warehouse stock adjustment"
}
```

### Approve Transfer
```
POST /api/transfers/:id/approve
```
**Roles**: Manager, Admin

**Effect**: 
- Validates stock availability at source warehouse
- Changes status to APPROVED
- Sets approvedBy and approvalDate

### Dispatch Transfer
```
POST /api/transfers/:id/dispatch
```
**Roles**: Staff, Manager, Admin

**Body**:
```json
{
  "items": [
    {
      "sku": "sku_id",
      "location": {
        "aisle": "A",
        "bin": "01"
      }
    }
  ]
}
```

**Effect**:
- Creates TRANSFER_OUT ledger entries at source
- Changes status to IN_TRANSIT
- Sets dispatchedDate

### Receive Transfer
```
POST /api/transfers/:id/receive
```
**Roles**: Staff, Manager, Admin

**Body**:
```json
{
  "items": [
    {
      "sku": "sku_id",
      "location": {
        "aisle": "B",
        "bin": "02"
      }
    }
  ]
}
```

**Effect**:
- Creates TRANSFER_IN ledger entries at destination
- Changes status to RECEIVED
- Sets receivedDate

### Reject Transfer
```
POST /api/transfers/:id/reject
```
**Roles**: Manager, Admin

**Body**:
```json
{
  "rejectionReason": "Insufficient stock at source"
}
```

---

## 6. Reorder & Reports (`/api/reorder`)

**All endpoints require Manager or Admin role**

### Get Reorder Suggestions
```
GET /api/reorder/suggestions?warehouseId=warehouse_id
```

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "sku": {...},
      "currentStock": 45,
      "minStock": 100,
      "safetyStock": 50,
      "recommendedOrderQty": 955,
      "urgency": "URGENT",
      "supplier": {...},
      "unitCost": 9.50,
      "totalCost": 9072.50,
      "leadTime": 7
    }
  ]
}
```

### Create Draft PR from Suggestions
```
POST /api/reorder/create-pr
```

**Body**:
```json
{
  "suggestions": [
    {
      "sku": "sku_id",
      "recommendedOrderQty": 500,
      "urgency": "HIGH"
    }
  ],
  "warehouseId": "warehouse_id"
}
```

### ABC Analysis Report
```
GET /api/reorder/reports/abc-analysis
```

**Response**: Categorizes SKUs into A (70% value), B (20% value), C (10% value) based on annual consumption value

### Stock Ageing Report
```
GET /api/reorder/reports/stock-ageing?warehouseId=warehouse_id
```

**Response**: Groups stock by age categories:
- Expired (< 0 days)
- Expiring Soon (0-30 days)
- Medium Age (31-90 days)
- Good (91-180 days)
- Fresh (> 180 days)

### Inventory Turnover Ratio
```
GET /api/reorder/reports/turnover-ratio?skuId=sku_id&months=12
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "sku": {...},
    "cogs": 125000,
    "avgInventoryValue": 25000,
    "turnoverRatio": 5.0,
    "daysInventory": 73,
    "period": "12 months"
  }
}
```

### Stock Value Report
```
GET /api/reorder/reports/stock-value?warehouseId=warehouse_id
```

**Response**: Total inventory value broken down by SKU

### Supplier Performance Report
```
GET /api/reorder/reports/supplier-performance
```

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "supplier": {...},
      "totalPOs": 25,
      "completedPOs": 23,
      "completionRate": 92.0,
      "onTimeDeliveryRate": 87.0,
      "avgLeadTime": 8.5,
      "totalAmount": 250000
    }
  ]
}
```

### Order Fulfillment Report
```
GET /api/reorder/reports/order-fulfillment?days=30
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "totalOrders": 150,
    "deliveredOrders": 135,
    "fulfillmentRate": 90.0,
    "avgFulfillmentTime": 3.5,
    "ordersByStatus": {
      "PENDING": 5,
      "RESERVED": 3,
      "PICKED": 2,
      "PACKED": 2,
      "SHIPPED": 3,
      "DELIVERED": 135
    }
  }
}
```

---

## Stock Ledger System

All stock movements are automatically recorded in the **immutable** StockLedger:

### Movement Types:
- **INWARD**: PO receiving, adjustments (increase)
- **OUTWARD**: Order fulfillment, adjustments (decrease)
- **TRANSFER_OUT**: Transfer dispatch from source warehouse
- **TRANSFER_IN**: Transfer receipt at destination warehouse
- **ADJUSTMENT**: Manual stock corrections

### Automatic Ledger Creation:
- **PO Receipt** → INWARD movements
- **Order Reservation** → OUTWARD movements
- **Transfer Dispatch** → TRANSFER_OUT at source
- **Transfer Receipt** → TRANSFER_IN at destination

---

## Workflow Summaries

### Purchase Requisition → Purchase Order
1. **Staff** creates PR (DRAFT status)
2. **Staff** submits PR → SUBMITTED
3. **Manager/Admin** approves PR → APPROVED
4. **Manager/Admin** converts PR to PO → CONVERTED_TO_PO
5. System creates PO(s) grouped by supplier with pricing tiers applied

### Purchase Order Workflow
1. **Manager/Admin** creates PO → CREATED
2. **Admin** approves PO → APPROVED
3. **Manager/Admin** sends PO to supplier → SENT
4. **Staff** receives items (partial or full) → PARTIALLY_RECEIVED or RECEIVED
5. System creates INWARD stock ledger entries
6. **Manager/Admin** closes PO → CLOSED

### Warehouse Transfer Workflow
1. **Staff** creates transfer request → REQUESTED
2. **Manager/Admin** approves transfer → APPROVED (validates stock)
3. **Staff** dispatches transfer → IN_TRANSIT (creates TRANSFER_OUT ledger)
4. **Staff** receives at destination → RECEIVED (creates TRANSFER_IN ledger)

---

## Error Responses

All errors follow this format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Testing Recommendations

1. **Create Master Data First**:
   - Warehouses
   - Suppliers (with pricing tiers)
   - SKUs (with min/max/safety stock levels)

2. **Test Workflows**:
   - Create and approve PRs
   - Convert PRs to POs
   - Receive PO items (verify stock ledger)
   - Create and execute transfers
   - Check reorder suggestions

3. **Test Reports**:
   - ABC Analysis (requires stock movements)
   - Stock Ageing (requires items with expiry dates)
   - Turnover Ratio (requires 12 months of data for accuracy)
   - Supplier Performance (requires completed POs)

4. **Role-Based Testing**:
   - Login as Staff, Manager, and Admin
   - Verify authorization on restricted endpoints

---

## Notes

- All date fields accept ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`
- Auto-generated numbers (PR, PO, Transfer) use format: `PR000001`, `PO000001`, `TRF000001`
- SKU codes are automatically converted to uppercase
- Soft deletes preserve data integrity (sets `isActive=false`)
- Stock ledger is immutable for audit compliance
- Pricing tiers are automatically applied when converting PR to PO based on quantity brackets
