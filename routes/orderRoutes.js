const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  createOrder,
  listMyOrders,
  listAllOrders,
  confirmOrder,
  completeOrder,
} = require('../controllers/orderController');

// Created by buyer-dashboard.html's checkout flow, right alongside the
// WhatsApp handoff, so the order actually reaches the seller's dashboard
// and the admin Payments queue.
router.post('/', protect, requireRole('buyer'), asyncHandler(createOrder));

router.get('/seller', protect, requireRole('seller'), asyncHandler(listMyOrders));
router.get('/', protect, requireRole('admin'), asyncHandler(listAllOrders));

router.put('/:id/confirm', protect, requireRole('seller', 'admin'), asyncHandler(confirmOrder));
router.put('/:id/complete', protect, requireRole('seller', 'admin'), asyncHandler(completeOrder));

module.exports = router;
