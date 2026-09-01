const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], required: true, default: 'buyer' },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
  },
  { timestamps: true }
);

// Hash the password before saving, only when it changed.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Shape returned to the frontend as `user` — matches what auth.html stores
// in localStorage's `as_user` and reads back (fullName, phone, email).
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    state: this.state,
    city: this.city,
  };
};

module.exports = mongoose.model('User', userSchema);
