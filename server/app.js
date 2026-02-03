const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to DB (safe to call in serverless; connection is cached in db.js)
connectDB();

// Health check - helps debug deployment (visit /api/health)
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const ok = mongoose.connection.readyState === 1;
    res.json({ ok, mongo: ok ? 'connected' : 'disconnected', hasJwt: !!process.env.JWT_SECRET });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

module.exports = app;

