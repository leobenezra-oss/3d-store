require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const pool = require('./db'); // Your database connection

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ FIXED: Session with PostgreSQL store
app.use(session({
  store: new pgSession({
    pool: pool,              // Your database pool from db.js
    tableName: 'session',    // Creates this table automatically
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'change-this-to-a-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true only on HTTPS
    sameSite: 'lax'
  }
}));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/payments', require('./routes/payments'));
app.use('/contact', require('./routes/contact'));
app.use('/reviews', require('./routes/reviews'));
app.use('/cart', require('./routes/cart'));

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views', 'register.html')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));