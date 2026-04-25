const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /products — all in-stock products for storefront
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, key, name, description, price_pence, image, stock, in_stock FROM products ORDER BY created_at ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// GET /products/admin/all — all products including hidden (admin only)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// POST /products/admin/update — update stock count and in_stock flag
router.post('/admin/update', requireAdmin, async (req, res) => {
  const { id, stock, in_stock } = req.body;
  if (id == null || stock == null || in_stock == null)
    return res.status(400).json({ error: 'Missing fields' });
  try {
    const stockNum = parseInt(stock);
    const inStockBool = in_stock === true || in_stock === 'true';
    await pool.query(
      'UPDATE products SET stock = $1, in_stock = $2 WHERE id = $3',
      [stockNum, inStockBool, id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// POST /products/admin/add — add a new product
router.post('/admin/add', requireAdmin, async (req, res) => {
  const { key, name, description, price_pence, image, stock } = req.body;
  if (!key || !name || !price_pence)
    return res.status(400).json({ error: 'key, name and price_pence are required' });
  try {
    const result = await pool.query(`
      INSERT INTO products (key, name, description, price_pence, image, stock, in_stock)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *
    `, [key, name, description || '', parseInt(price_pence), image || '', parseInt(stock) || 0]);
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A product with that key already exists' });
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// POST /products/admin/delete
router.post('/admin/delete', requireAdmin, async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing id' });
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ── admin guard ────────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const userEmail = req.session?.user?.email?.toLowerCase();
  if (!userEmail || !adminEmails.includes(userEmail)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

module.exports = router;