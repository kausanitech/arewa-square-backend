const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// ══════════════════════════════════════════════════════════
// ONE-TIME SETUP ROUTE — creates the first admin account.
//
// There is no public "register as admin" flow on purpose (anyone
// could otherwise make themselves an admin). This route is the
// one-time exception, protected by a secret only you know.
//
// HOW TO USE:
//   1. Add a SETUP_SECRET variable in Railway — any long random
//      string you make up, just like JWT_SECRET.
//   2. Visit this URL once in your browser (fill in your own
//      values):
//      https://<your-railway-url>/api/setup/create-admin?secret=YOUR_SETUP_SECRET&email=you@example.com&password=SomePassword123&fullName=Your+Name&phone=08012345678
//   3. You'll get a success message. Log into admin.html with
//      that email/password.
//   4. IMPORTANT: after that works, delete this file
//      (routes/setupRoutes.js), remove the
//      app.use('/api/setup', ...) line in server.js, remove the
//      SETUP_SECRET variable in Railway, and redeploy. Leaving
//      this route live is a security risk — anyone who guessed
//      your secret could create more admin accounts.
// ══════════════════════════════════════════════════════════

router.get(
  '/create-admin',
  asyncHandler(async (req, res) => {
    const { secret, email, password, fullName, phone } = req.query;

    if (!process.env.SETUP_SECRET) {
      return res.status(500).send('SETUP_SECRET is not set on the server. Add it in Railway Variables first.');
    }
    if (!secret || secret !== process.env.SETUP_SECRET) {
      return res.status(403).send('Wrong or missing secret.');
    }
    if (!email || !password || !fullName || !phone) {
      return res.status(400).send('Please provide email, password, fullName, and phone as URL parameters.');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.role === 'admin') {
        return res.send(`An admin account already exists for ${email}. You can log in with it directly.`);
      }
      return res.status(409).send(`An account already exists for ${email} with role "${existing.role}". Use a different email for the admin account.`);
    }

    await User.create({ fullName, email, phone, password, role: 'admin' });
    res.send(`✅ Admin account created for ${email}. You can now log into admin.html with this email and password. Please remove this setup route now — see the comment at the top of routes/setupRoutes.js.`);
  })
);

module.exports = router;
