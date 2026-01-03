# Putaway & Batch Tracking Implementation

## User Interface Details

### Putaway Management Page

The user sees the following information for pending putaway items:

#### Main Table Columns:
1. **Batch Number** - Unique batch identifier (e.g., BATCH001)
2. **Product** - Product name and SKU code
3. **Quantity** - Number of units in the batch
4. **Received Date** - When the goods were received
5. **Expiry Date** - Product expiration date
6. **Days to Expiry** - Calculated remaining days with color coding:
   - 🔴 Red: Expired items
   - 🟠 Orange: 1-30 days (urgent)
   - 🟡 Yellow: 31-90 days (attention needed)
   - 🟢 Green: 90+ days (good condition)
7. **Supplier** - Supplier name
8. **Current Location** - Shows "RECEIVING-{warehouseId}" for pending items
9. **Actions** - "Assign Location" button

#### Putaway Modal:
When user clicks "Assign Location", they see:
- **Batch Information Summary**: Product, Quantity, Expiry Date, Supplier
- **Location Input Fields**:
  - Aisle (e.g., A, B, C)
  - Section (e.g., 01, 02, 03)
  - Bin (e.g., 001, 002, 003)
- **Live Preview**: Shows final location code (e.g., A-01-001)
- **Confirm Putaway** button to save the location

## Database Operations & Implementation

### 1. Batch Creation (During Goods Receipt)

**File**: `backend/src/controllers/poController.js` - `receivePO` function

When goods are received from a Purchase Order:

```javascript
// Create new batch record
await Batch.create({
  batchNumber: receivedItem.batchNumber,
  product: sku.product,
  initialQuantity: receivedItem.receivedQuantity,
  currentQuantity: receivedItem.receivedQuantity,
  receivedDate: receivedDate || new Date(),
  expiryDate: receivedItem.expiryDate,
  location: `RECEIVING-${po.warehouse}`,  // Initial receiving location
  supplier: po.supplier,
  status: 'Active',
  notes: `Received via PO ${po.poNumber}`
});
```

**Purpose**: Creates a comprehensive batch record for tracking

### 2. Stock Ledger Entry

**File**: `backend/src/services/stockService.js` - `recordMovement` function

Simultaneously records stock movement:

```javascript
await stockService.recordMovement({
  sku: receivedItem.skuId,
  warehouse: po.warehouse,
  movementType: 'INWARD',
  quantity: receivedItem.receivedQuantity,
  referenceType: 'PO',
  referenceId: po._id,
  user: req.user._id,
  batchNumber: receivedItem.batchNumber,
  expiryDate: receivedItem.expiryDate,
  remarks: `Received from PO ${po.poNumber}`
});
```

**Purpose**: Maintains detailed transaction history with batch linkage

### 3. Batch Status Auto-Calculation

**File**: `backend/src/models/Batch.js` - pre-save hook

Before saving, automatically calculates batch status:

```javascript
batchSchema.pre('save', function(next) {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((this.expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (this.currentQuantity === 0) {
    this.status = 'Depleted';
  } else if (this.expiryDate < now) {
    this.status = 'Expired';
  } else if (daysUntilExpiry <= 30) {
    this.status = 'Expiring Soon';
  } else if (this.currentQuantity <= this.initialQuantity * 0.2) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Active';
  }
  next();
});
```

**Statuses**:
- `Active` - Normal stock with good expiry
- `Low Stock` - Quantity below 20% of initial
- `Expiring Soon` - Less than 30 days to expiry
- `Expired` - Past expiration date
- `Depleted` - No stock remaining

### 4. Putaway Location Assignment

**File**: `backend/src/controllers/batchController.js` - `updateBatch` function

When user confirms putaway:

```javascript
await batchService.updateBatch(batchId, {
  location: `${aisle}-${section}-${bin}`  // e.g., "A-01-001"
});
```

Updates batch location from RECEIVING to actual storage location.

### 5. Batch Tracking Queries

**Available Operations**:

#### Get All Batches (with filters)
```javascript
GET /api/batches?status=Active&search=BATCH001
```

#### Get Pending Putaway Items
```javascript
// Frontend filters batches where location starts with "RECEIVING"
const pending = batches.filter(batch => 
  batch.location && batch.location.startsWith('RECEIVING')
);
```

#### Get Batch History
```javascript
GET /api/batches/:id
// Returns full batch details with product and supplier info
```

### 6. Expiry Tracking Features

#### Days to Expiry Calculation
```javascript
const getDaysUntilExpiry = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return days;
};
```

#### Color-Coded Alerts
- Expired items highlighted in red
- Near-expiry items (30 days) in orange
- Attention needed (90 days) in yellow
- Good condition (90+ days) in green

### 7. FIFO Support

The system supports First-In-First-Out by:
- Tracking `receivedDate` for each batch
- Displaying days to expiry prominently
- Visual indicators for prioritization
- Quick sorting by expiry date

## Key Features Implemented

### ✅ Batch Tracking
- Unique batch numbers
- Quantity tracking (initial vs current)
- Received and expiry dates
- Supplier linkage
- Location management

### ✅ Expiry Management
- Automatic expiry status calculation
- Days to expiry display
- Color-coded alerts
- Expired batch identification

### ✅ Location Management
- Receiving area designation
- Structured location codes (Aisle-Section-Bin)
- Putaway confirmation workflow
- Location history via batch records

### ✅ Stock Integration
- Stock ledger entries with batch numbers
- Warehouse-specific tracking
- Movement history
- Balance calculation

### ✅ Quality Control
- Status monitoring (Active, Low Stock, Expiring, Expired, Depleted)
- Automatic status updates
- Visual indicators
- Alerts for attention needed

## Database Schema Summary

### Batch Model
```javascript
{
  batchNumber: String (unique, required),
  product: ObjectId (ref: Product),
  initialQuantity: Number,
  currentQuantity: Number,
  receivedDate: Date,
  expiryDate: Date,
  location: String (e.g., "A-01-001" or "RECEIVING-{warehouseId}"),
  supplier: ObjectId (ref: Supplier),
  status: Enum ['Active', 'Low Stock', 'Expiring Soon', 'Expired', 'Depleted'],
  notes: String
}
```

### Stock Ledger Model
```javascript
{
  sku: ObjectId (ref: SKU),
  warehouse: ObjectId (ref: Warehouse),
  movementType: Enum ['INWARD', 'OUTWARD', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'],
  quantity: Number,
  batchNumber: String (links to Batch),
  expiryDate: Date,
  referenceType: Enum ['PO', 'ORDER', 'TRANSFER', 'ADJUSTMENT'],
  referenceId: ObjectId,
  balanceQuantity: Number,
  user: ObjectId (ref: User),
  transactionDate: Date
}
```

## Workflow Summary

1. **Goods Receipt** → Creates Batch with RECEIVING location
2. **Putaway Page** → Shows batches in RECEIVING locations
3. **Location Assignment** → User assigns Aisle-Section-Bin location
4. **Update Batch** → Location updated from RECEIVING to actual storage
5. **Tracking** → Batch remains trackable with full history
6. **Expiry Monitoring** → Automatic status updates and alerts
7. **Stock Management** → All movements linked to batches

This implementation provides complete traceability from receipt to storage, with automated expiry tracking and quality management.
