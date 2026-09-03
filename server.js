require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const disputeRoutes = require('./routes/disputeRoutes');

const app = express();

connectDB();

// ── Security & parsing middleware ──
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // cross-origin so uploaded images load from the frontend's domain
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — locked to the frontend origins listed in .env, not wide open.
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools like Postman/curl (no origin header) and any listed origin.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// General rate limiting — generous, just a floor against abuse.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { message: 'Too many requests. Please try again in a few minutes.' },
  })
);

// Tighter limiting on auth routes specifically, against credential stuffing.
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many attempts. Please try again in a few minutes.' },
  })
);

// Serve uploaded files. KNOWN GAP: local disk on Railway is wiped on every
// redeploy — see middleware/upload.js for the Cloudinary/S3 migration note.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/setup', require('./routes/setupRoutes')); // TEMPORARY — see routes/setupRoutes.js, remove after creating your admin account

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AREWA SQUARE API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
