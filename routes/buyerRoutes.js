const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { listBuyers, getMyProfile, updateMyProfile } = require('../controllers/buyerController');

// IMPORTANT: '/me' must be registered before any '/:id'-style route would be
// (there isn't one in this router, but keeping the specific route first is
// the safe habit regardless — avoids ever accidentally shadowing it later).
router.get('/me', protect, requireRole('buyer'), asyncHandler(getMyProfile));
router.put('/profile', protect, requireRole('buyer'), asyncHandler(updateMyProfile));

router.get('/', protect, requireRole('admin'), asyncHandler(listBuyers));

module.exports = router;
