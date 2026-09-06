const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

// upload.fields() safely no-ops for non-multipart requests (buyer JSON
// registration), so this one route serves both buyer and seller signup —
// matching the two fetch('/auth/register', ...) call sites in auth.html.
router.post(
  '/register',
  upload.fields([
    { name: 'shopPhoto', maxCount: 1 },
    { name: 'govId', maxCount: 1 },
  ]),
  asyncHandler(register)
);

router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

module.exports = router;
