require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

const app = express();

// Parse incoming data from forms
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (CSS, images) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Session setup — keeps users logged in between page visits
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport setup (handles login)
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/payments', paymentRoutes);

const contactRoutes = require('./routes/contact');
const reviewRoutes = require('./routes/reviews');
const cartRoutes = require('./routes/cart');

app.use('/contact', contactRoutes);
app.use('/reviews', reviewRoutes);
app.use('/cart', cartRoutes);

// Shortcuts
app.get('/login', (req, res) => res.redirect('/auth/login'));
app.get('/register', (req, res) => res.redirect('/auth/register'));

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});