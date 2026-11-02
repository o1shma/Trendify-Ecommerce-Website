// routes/orders.js
const express = require('express');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Create order
router.post('/', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const items = req.body.items || []; // [{product_id, quantity}]
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items provided' });

  // calculate total and validate products
  let total = 0;
  for (const it of items) {
    const [p] = await req.db.execute('SELECT price FROM products WHERE id=?', [it.product_id]);
    if (p.length === 0) return res.status(400).json({ error: `Invalid product ${it.product_id}` });
    total += parseFloat(p[0].price) * parseInt(it.quantity || 1);
  }

  // create order
  const [orderRes] = await req.db.execute('INSERT INTO orders (user_id, total_amount) VALUES (?, ?)', [userId, total]);
  const orderId = orderRes.insertId;

  for (const it of items) {
    const [p] = await req.db.execute('SELECT price FROM products WHERE id=?', [it.product_id]);
    await req.db.execute(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
      [orderId, it.product_id, it.quantity, p[0].price]
    );
  }

  res.json({ success: true, orderId });
});

// Get orders for logged-in user
router.get('/', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const [orders] = await req.db.execute('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC', [userId]);
  res.json(orders);
});

module.exports = router;
