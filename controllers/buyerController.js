const User = require('../models/User');
const Buyer = require('../models/Buyer');

// GET /api/buyers?limit=N — admin only, read by admin.html's Buyers tab
async function listBuyers(req, res) {
  const limit = Math.min(Number(req.query.limit) || 50, 500);

  const buyers = await Buyer.find()
    .populate('user', 'fullName phone email createdAt')
    .sort({ createdAt: -1 })
    .limit(limit);

  // Flatten to what admin.html reads: b.name/b.fullName, b.phone, b.city, b.createdAt
  const shaped = buyers.map((b) => ({
    _id: b._id,
    fullName: b.user?.fullName,
    name: b.user?.fullName,
    phone: b.user?.phone,
    email: b.user?.email,
    state: b.state,
    city: b.city,
    createdAt: b.user?.createdAt || b.createdAt,
  }));

  res.json({ buyers: shaped });
}

// GET /api/buyers/me — the logged-in buyer's own profile, read by
// buyer-dashboard.html's Profile tab (and its sidebar/greeting).
async function getMyProfile(req, res) {
  const buyer = await Buyer.findOne({ user: req.user._id }).populate('user', 'fullName phone email createdAt');
  if (!buyer) return res.status(404).json({ message: 'No buyer profile found for this account.' });

  res.json({
    buyer: {
      _id: buyer._id,
      city: buyer.city,
      state: buyer.state,
      createdAt: buyer.user?.createdAt || buyer.createdAt,
      user: {
        fullName: buyer.user?.fullName,
        email: buyer.user?.email,
        phone: buyer.user?.phone,
      },
    },
  });
}

// PUT /api/buyers/profile — the logged-in buyer updates their own city/state
async function updateMyProfile(req, res) {
  const buyer = await Buyer.findOne({ user: req.user._id });
  if (!buyer) return res.status(404).json({ message: 'No buyer profile found for this account.' });

  if (req.body.city !== undefined) buyer.city = req.body.city;
  if (req.body.state !== undefined) buyer.state = req.body.state;
  await buyer.save();

  res.json({ message: 'Profile updated.', buyer });
}

module.exports = { listBuyers, getMyProfile, updateMyProfile };
