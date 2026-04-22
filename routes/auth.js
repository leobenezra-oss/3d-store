const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('../db');

// ── Local Strategy (email + password) ──
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return done(null, false, { message: 'No account with that email' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false, { message: 'Wrong password' });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// ── Session serialization ──
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// ── Routes ──
router.get('/register', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/register.html'));
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashed]);
    res.redirect('/login');
  } catch (err) {
    res.redirect('/register?error=exists');
  }
});

router.get('/login', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/login.html'));
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?error=true'
}));

router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/login'));
});

module.exports = router;