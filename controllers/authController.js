const User = require('../models/User');
const Buyer = require('../models/Buyer');
const Seller = require('../models/Seller');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
// Buyers send JSON (see auth.html completeBuyerReg): fullName, email, phone,
// password, state, city, role: 'buyer'.
// Sellers send multipart/form-data (see auth.html completeSellerReg):
// fullName, businessName, category, phone, whatsappNumber, state, city,
// address, latitude, longitude, description, email, password, role: 'seller',
// plus optional govId and shopPhoto files.
async function register(req, res) {
  const { role } = req.body;

  if (role === 'seller') {
    return registerSeller(req, res);
  }
  return registerBuyer(req, res);
}

async function registerBuyer(req, res) {
  const { fullName, email, phone, password, state, city } = req.body;

  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ message: 'Full name, email, phone, and password are all required.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const user = await User.create({ fullName, email, phone, password, state, city, role: 'buyer' });
  await Buyer.create({ user: user._id, state, city });

  const token = generateToken(user._id, user.role);
  res.status(201).json({ token, role: user.role, user: user.toPublicJSON() });
}

async function registerSeller(req, res) {
  const {
    fullName, businessName, category, phone, whatsappNumber,
    state, city, address, latitude, longitude, description, email, password,
  } = req.body;

  if (!fullName || !businessName || !phone || !state || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const user = await User.create({ fullName, email, phone, password, state, city, role: 'seller' });

  const shopPhotoFile = req.files?.shopPhoto?.[0];
  const govIdFile = req.files?.govId?.[0];

  const seller = await Seller.create({
    user: user._id,
    businessName,
    category: category || 'Other',
    whatsappNumber: whatsappNumber || phone,
    state,
    city,
    address,
    description,
    latitude: latitude !== undefined && latitude !== '' ? Number(latitude) : null,
    longitude: longitude !== undefined && longitude !== '' ? Number(longitude) : null,
    shopPhotoUrl: shopPhotoFile ? `/uploads/${shopPhotoFile.filename}` : null,
    govIdUrl: govIdFile ? `/uploads/${govIdFile.filename}` : null,
    status: 'pending',
  });

  const token = generateToken(user._id, user.role);
  res.status(201).json({
    token,
    role: user.role,
    user: user.toPublicJSON(),
    seller: { _id: seller._id, businessName: seller.businessName, status: seller.status },
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
  }

  const token = generateToken(user._id, user.role);
  const payload = { token, role: user.role, user: user.toPublicJSON() };

  if (user.role === 'seller') {
    const seller = await Seller.findOne({ user: user._id });
    if (seller) payload.seller = seller;
  }

  res.json(payload);
}

module.exports = { register, login };
