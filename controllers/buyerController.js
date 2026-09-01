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

module.exports = { listBuyers };
