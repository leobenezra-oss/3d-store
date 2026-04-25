const express = require('express');
const router = express.Router();
const admin = require('../firebase-admin');
const pool = require('../db');

// POST /auth/session — called by frontend after Firebase login
router.post('/session', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'No token provided' });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decoded;

    await pool.query(`
      INSERT INTO users (firebase_uid, email)
      VALUES ($1, $2)
      ON CONFLICT (firebase_uid) DO UPDATE SET email = $2
    `, [uid, email]);

    const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    req.session.user = result.rows[0];

    // Wait for session to be written to DB before responding
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session save failed' });
      }
      res.json({ ok: true });
    });
  } catch (err) {
    console.error('Auth session error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /auth/me — returns current user
router.get('/me', (req, res) => {
  if (req.session.user) res.json(req.session.user);
  else res.status(401).json({ error: 'Not logged in' });
});

module.exports = router;