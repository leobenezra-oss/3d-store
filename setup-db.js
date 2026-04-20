require('dotenv').config();
const pool = require('./db');

async function setup() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      google_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      product_name TEXT,
      amount INTEGER,
      stripe_payment_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Tables created successfully');
  process.exit();
}

setup();