const express = require('express');
const router = express.Router();
const stockLedgerController = require('../controllers/stockLedgerController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/stock-ledger - Get all transactions
router.get('/', stockLedgerController.getAllTransactions);

// GET /api/stock-ledger/:id - Get single transaction
router.get('/:id', stockLedgerController.getTransaction);

// GET /api/stock-ledger/sku/:skuId - Get SKU history
router.get('/sku/:skuId', stockLedgerController.getSKUHistory);

module.exports = router;
