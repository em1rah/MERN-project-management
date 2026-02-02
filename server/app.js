const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to DB (safe to call in serverless; connection is cached in db.js)
connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

module.exports = app;

