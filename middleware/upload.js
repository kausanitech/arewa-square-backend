const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ══════════════════════════════════════════════════════════
// KNOWN GAP: this stores uploads on local disk, which Railway
// wipes on every redeploy. Fine for local development, NOT safe
// for production. To migrate to Cloudinary or S3:
//   1. Replace `storage` below with a Cloudinary/S3 multer
//      storage engine (e.g. multer-storage-cloudinary).
//   2. In the controllers, replace `req.file.filename`/
//      `req.files.map(f => f.filename)` with the URL the
//      storage engine returns (e.g. req.file.path for
//      multer-storage-cloudinary).
//   Nothing else in the codebase needs to change — every
//   controller already just stores whatever URL string it gets.
// ══════════════════════════════════════════════════════════

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Only .jpg, .jpeg, .png, and .webp image files are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024 },
});

module.exports = upload;
