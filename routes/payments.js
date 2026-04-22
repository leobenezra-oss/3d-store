const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const products = {
  'hexagon-twist':     { name: 'Fidget Hexagon Twist',    amount: 699,  currency: 'gbp' },
  'spiral-cone':       { name: 'Spiral Fidget Cone',       amount: 799,  currency: 'gbp' },
  'giant-spiral-cone': { name: 'Giant Spiral Fidget Cone', amount: 1099, currency: 'gbp' },
  'mesh-fidget':       { name: 'Mesh Fidget',              amount: 899,  currency: 'gbp' },
  'infinity-cube':     { name: 'Infinity Cube',            amount: 999,  currency: 'gbp' },
  'octopus-fidget':    { name: 'Octopus Fidget',           amount: 1199, currency: 'gbp' },
  'flex-slug':         { name: 'Flex Slug',                amount: 899,  currency: 'gbp' },
  'spinner-rings':     { name: 'Fidget Spinner Rings',     amount: 699,  currency: 'gbp' },
};

router.get('/checkout', async (req, res) => {
  const product = products[req.query.product];
  if (!product) return res.status(404).send('Product not found');

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: product.currency,
          product_data: { name: product.name },
          unit_amount: product.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/payments/success`,
      cancel_url: `${process.env.BASE_URL}/`,
    });

    res.redirect(session.url);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong with checkout');
  }
});

const pool = require('../db');

router.get('/success', async (req, res) => {
  // Clear cart after successful payment
  if (req.query.user) {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.query.user]).catch(() => {});
  }
  res.send(`
    <html>
      <body style="font-family:sans-serif;background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
        <div>
          <h1 style="font-size:2.5rem;margin-bottom:1rem;">🎉 Order confirmed!</h1>
          <p style="color:#aaa;margin-bottom:2rem;">Thanks for your purchase. We'll get it printed and shipped soon.</p>
          <a href="/" style="background:#a78bfa;color:#000;padding:0.8rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;">Back to store</a>
        </div>
      </body>
    </html>
  `);
});

module.exports = router;