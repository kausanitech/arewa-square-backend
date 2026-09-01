const express = require('express');
const router = express.Router();
const { protect, requireRole, optionalAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  listSellers,
  getMyShop,
  updateMyShop,
  approveSeller,
  rejectSeller,
  suspendSeller,
  reactivateSeller,
} = require('../controllers/sellerController');

// Public list (buyer-dashboard.html, index.html) — but shows every status
// to a logged-in admin (admin.html's Pending/All Sellers tabs read this
// same endpoint with a higher limit).
router.get('/', optionalAuth, asyncHandler(listSellers));

// Seller's own shop
router.get('/me', protect, requireRole('seller'), asyncHandler(getMyShop));
router.put('/profile', protect, requireRole('seller'), asyncHandler(updateMyShop));

// Admin actions
router.put('/:id/approve', protect, requireRole('admin'), asyncHandler(approveSeller));
router.put('/:id/reject', protect, requireRole('admin'), asyncHandler(rejectSeller));
router.put('/:id/suspend', protect, requireRole('admin'), asyncHandler(suspendSeller));
router.put('/:id/reactivate', protect, requireRole('admin'), asyncHandler(reactivateSeller));

module.exports = router;
