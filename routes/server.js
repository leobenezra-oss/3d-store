require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const pool = require('../db');
require('../setup-db');  // ← add this line

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'change-this-to-a-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Routes
app.use('/auth', require('./auth'));
app.use('/products', require('./products'));
app.use('/payments', require('./payments'));
app.use('/contact', require('./contact'));
app.use('/reviews', require('./reviews'));
app.use('/cart', require('./cart'));

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../views/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../views/register.html')));

app.get('/admin', (req, res) => {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const userEmail = req.session?.user?.email?.toLowerCase();
  if (!userEmail || !adminEmails.includes(userEmail)) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, '../views/admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));