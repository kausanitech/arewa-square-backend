const Order = require('../models/Order');
const Seller = require('../models/Seller');
const generateOrderId = require('../utils/generateOrderId');

// POST /api/orders — created from buyer-dashboard.html's sendOrder() right
// alongside the WhatsApp handoff, so the order actually reaches the
// seller's dashboard and the admin Payments queue instead of only
// existing as a WhatsApp message.
// body: { sellerId, items: [{ name, price, quantity }], total }
async function createOrder(req, res) {
  const { sellerId, items, total } = req.body;

  if (!sellerId || !Array.isArray(items) || items.length === 0 || total === undefined) {
    return res.status(400).json({ message: 'sellerId, items, and total are required.' });
  }

  const seller = await Seller.findById(sellerId);
  if (!seller) return res.status(404).json({ message: 'Shop not found.' });

  const order = await Order.create({
    orderId: generateOrderId(),
    buyer: req.user?._id || null,
    seller: seller._id,
    items,
    total,
    status: 'new',
  });

  res.status(201).json({ order });
}

function shapeOrder(orderDoc) {
  const o = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
  return {
    _id: o._id,
    orderId: o.orderId,
    sellerName: o.seller?.businessName,
    shopName: o.seller?.businessName,
    items: o.items,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
  };
}

// GET /api/orders/seller — the logged-in seller's own orders
async function listMyOrders(req, res) {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) return res.status(404).json({ message: 'No shop found for this account.' });

  const orders = await Order.find({ seller: seller._id }).populate('seller', 'businessName').sort({ createdAt: -1 });
  res.json({ orders: orders.map(shapeOrder) });
}

// GET /api/orders — admin only, platform-wide, read by admin-payments.html
async function listAllOrders(req, res) {
  const orders = await Order.find().populate('seller', 'businessName').sort({ createdAt: -1 }).limit(1000);
  res.json({ orders: orders.map(shapeOrder) });
}

// Shared guard: only the owning seller or an admin may confirm/complete an order.
async function assertCanManageOrder(order, user) {
  if (user.role === 'admin') return true;
  const seller = await Seller.findOne({ user: user._id });
  return seller && String(order.seller) === String(seller._id);
}

// PUT /api/orders/:id/confirm — payment confirmed
async function confirmOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (!(await assertCanManageOrder(order, req.user))) {
    return res.status(403).json({ message: 'You do not have permission to update this order.' });
  }

  order.status = 'confirmed';
  await order.save();
  res.json({ message: 'Payment confirmed.', order });
}

// PUT /api/orders/:id/complete — order fulfilled
async function completeOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (!(await assertCanManageOrder(order, req.user))) {
    return res.status(403).json({ message: 'You do not have permission to update this order.' });
  }

  order.status = 'completed';
  await order.save();
  res.json({ message: 'Order marked completed.', order });
}

module.exports = { createOrder, listMyOrders, listAllOrders, confirmOrder, completeOrder };
