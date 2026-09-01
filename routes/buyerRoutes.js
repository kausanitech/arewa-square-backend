const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { listBuyers } = require('../controllers/buyerController');

router.get('/', protect, requireRole('admin'), asyncHandler(listBuyers));

module.exports = router;
