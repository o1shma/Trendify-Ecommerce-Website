// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await req.db.execute(
      'INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)',
      [first_name, last_name, email, hash]
    );
    req.session.userId = result.insertId;
    res.json({ success: true, userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await req.db.execute('SELECT id, first_name, email, password_hash FROM users WHERE email=? LIMIT 1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.userId = user.id;
    res.json({ success: true, user: { id: user.id, first_name: user.first_name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Me (check session)
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const [rows] = await req.db.execute('SELECT id, first_name, last_name, email, created_at FROM users WHERE id=? LIMIT 1', [req.session.userId]);
  res.json({ user: rows[0] || null });
});

module.exports = router;
