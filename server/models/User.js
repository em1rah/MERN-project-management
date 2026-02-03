const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, unique: true },
  school: { type: String, required: true },
  role: {
    type: String,
    required: true,
  },
  roleOther: { type: String },
  coursesInterested: [{ type: String }],
  coursesOther: [{ type: String }],
  interestedInCertification: { type: Boolean, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleType: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);
