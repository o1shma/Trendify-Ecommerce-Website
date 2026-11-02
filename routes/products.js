// routes/products.js
const express = require('express');
const router = express.Router();

// GET all
router.get('/', async (req, res) => {
  const [rows] = await req.db.execute('SELECT * FROM products ORDER BY id DESC');
  res.json(rows);
});

// GET single
router.get('/:id', async (req, res) => {
  const [rows] = await req.db.execute('SELECT * FROM products WHERE id=?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// CREATE
router.post('/', async (req, res) => {
  const { title, description, price, category, image_path } = req.body;
  const [result] = await req.db.execute(
    'INSERT INTO products (title, description, price, category, image_path) VALUES (?, ?, ?, ?, ?)',
    [title, description, price, category, image_path]
  );
  res.json({ success: true, insertId: result.insertId });
});

// UPDATE
router.put('/:id', async (req, res) => {
  const { title, description, price, category, image_path } = req.body;
  await req.db.execute(
    'UPDATE products SET title=?, description=?, price=?, category=?, image_path=? WHERE id=?',
    [title, description, price, category, image_path, req.params.id]
  );
  res.json({ success: true });
});

// DELETE
router.delete('/:id', async (req, res) => {
  await req.db.execute('DELETE FROM products WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
