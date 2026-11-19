require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

const PORT = process.env.API_PORT || 3307;

// ── Rate limiting ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { code: '429', message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { code: '429', message: 'Too many login attempts, please try again later.' },
});

const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { code: '429', message: 'Too many complaints submitted, please try again later.' },
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(generalLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Apply specific limiters
app.use('/api/v1/login', authLimiter);
app.use('/api/v1/createcomplaints', complaintLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
const routerDir = './routers';
const filenames = fs.readdirSync(routerDir);
filenames.forEach(file => {
  const routerPath = path.join(__dirname, routerDir, file);
  const router = require(routerPath);
  app.use('/api/v1/', router);
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
