const nodemailer = require('nodemailer');

// ══════════════════════════════════════════════════════════
// Generic SMTP email sender. Works with Gmail, Outlook, Zoho,
// or any provider that gives you SMTP credentials.
//
// Required Railway variables:
//   EMAIL_HOST      e.g. smtp.gmail.com
//   EMAIL_PORT      e.g. 587
//   EMAIL_USER      the mailbox address that sends the email
//   EMAIL_PASS      an app password (NOT your normal account password —
//                   see the Gmail setup note in the README)
//   EMAIL_FROM      what recipients see as the sender, e.g.
//                   "AREWA SQUARE <arewasquare@gmail.com>"
// ══════════════════════════════════════════════════════════

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // true for port 465, false for 587/others
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email is not configured on the server yet (missing EMAIL_HOST/EMAIL_USER/EMAIL_PASS).');
  }
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
