const fs = require('fs');

const content = `const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/reviews.html'));
});

router.get('/data', async (req, res) => {
  const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, rating, message } = req.body;
  if (!name || !rating || !message) return res.redirect('/reviews?error=true');
  await pool.query('INSERT INTO reviews (name, rating, message) VALUES ($1, $2, $3)', [name, parseInt(rating), message]);
  res.redirect('/reviews?submitted=true');
});

module.exports = router;`;

fs.writeFileSync('routes/reviews.js', content);
console.log('done');