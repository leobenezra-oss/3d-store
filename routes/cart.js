const express = require('express');
const router = express.Router();
const pool = require('../db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const requireAuth = require('../middleware/requireAuth');

// All cart routes require login
router.use(requireAuth);

// GET /cart — return cart items as JSON
router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM cart_items WHERE user_id = $1 ORDER BY created_at ASC',
    [req.session.user.id]
  );
  res.json(result.rows);
});

// POST /cart/add — add item or increment quantity
router.post('/add', async (req, res) => {
  const { product_key, product_name, amount } = req.body;
  if (!product_key || !product_name || !amount) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  await pool.query(`
    INSERT INTO cart_items (user_id, product_key, product_name, amount, quantity)
    VALUES ($1, $2, $3, $4, 1)
    ON CONFLICT (user_id, product_key)
    DO UPDATE SET quantity = cart_items.quantity + 1
  `, [req.session.user.id, product_key, product_name, parseInt(amount)]);

  const result = await pool.query(
    'SELECT * FROM cart_items WHERE user_id = $1 ORDER BY created_at ASC',
    [req.session.user.id]
  );
  res.json(result.rows);
});

// POST /cart/remove — decrease quantity or remove item
router.post('/remove', async (req, res) => {
  const { product_key } = req.body;
  const existing = await pool.query(
    'SELECT * FROM cart_items WHERE user_id = $1 AND product_key = $2',
    [req.session.user.id, product_key]
  );
  if (existing.rows[0]?.quantity > 1) {
    await pool.query(
      'UPDATE cart_items SET quantity = quantity - 1 WHERE user_id = $1 AND product_key = $2',
      [req.session.user.id, product_key]
    );
  } else {
    await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_key = $2',
      [req.session.user.id, product_key]
    );
  }
  const result = await pool.query(
    'SELECT * FROM cart_items WHERE user_id = $1 ORDER BY created_at ASC',
    [req.session.user.id]
  );
  res.json(result.rows);
});

// POST /cart/checkout — create Stripe session for all cart items
router.post('/checkout', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM cart_items WHERE user_id = $1',
    [req.session.user.id]
  );
  const items = result.rows;
  if (items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const line_items = items.map(item => ({
    price_data: {
      currency: 'gbp',
      product_data: { name: item.product_name },
      unit_amount: item.amount,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/payments/success?clear=true&user=${req.session.user.id}`,
    cancel_url: `${process.env.BASE_URL}/`,
  });

  res.json({ url: session.url });
});

module.exports = router;