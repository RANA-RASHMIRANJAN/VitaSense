const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getDb } = require('../db/authDb');
const { getJwtSecret } = require('../middleware/auth');

const router = express.Router();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  // Simple and safe (not fully RFC-complete).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/signup', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Email and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Password must be at least 8 characters' });
    }

    const db = await getDb();
    const exists = db.data.users.find((u) => u.email === email);
    if (exists) {
      return res.status(409).json({ error: 'USER_EXISTS', message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: `u_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    db.data.users.push(user);
    await db.write();

    const token = jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ error: 'SIGNUP_ERROR', message: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Email and password are required' });
    }

    const db = await getDb();
    const user = db.data.users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'LOGIN_ERROR', message: 'Failed to login' });
  }
});

module.exports = router;

