require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function seed() {
  await connectDB();
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  let admin = await User.findOne({ email: adminEmail });
  if (admin) {
    console.log('Admin already exists:', adminEmail);
    process.exit(0);
  }
  const hashed = await bcrypt.hash(adminPassword, 10);
  admin = new User({ fullName: 'Admin', school: 'N/A', role: 'Admin', email: adminEmail, password: hashed, roleType: 'admin', interestedInCertification: false });
  await admin.save();
  console.log('Admin created:', adminEmail);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
