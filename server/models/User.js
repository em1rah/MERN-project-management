const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100,
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]{1,100}$/.test(v || '')
      },
      message: 'Full name must contain only letters and spaces and be 100 characters or fewer.',
    },
  },
  school: { type: String, required: true, maxlength: 100 },
  role: {
    type: String,
    required: true,
  },
  roleOther: { type: String, maxlength: 50 },
  coursesInterested: {
    type: [{ type: String }],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length <= 10
      },
      message: 'Too many courses selected (max 10).',
    },
  },
  coursesOther: {
    type: [{ type: String }],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length <= 10
      },
      message: 'Too many other courses specified (max 10).',
    },
  },
  interestedInCertification: { type: Boolean, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
  },
  password: { type: String, required: true, minlength: 8, maxlength: 128 },
  roleType: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);
