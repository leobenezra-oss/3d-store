require('dotenv').config();
const pool = require('./db');

async function setup() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      firebase_uid TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
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

    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_key TEXT NOT NULL,
      product_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, product_key)
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price_pence INTEGER NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 10,
      in_stock BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Tables created/verified.');

  // Seed all products (insert only if key doesn't exist)
  const products = [
    {
      key: 'hexagon-twist',
      name: 'Fidget Hexagon Twist',
      description: 'A satisfying interlocking hexagon you can twist and spin endlessly. Compact and pocket-friendly.',
      price_pence: 699,
      image: '/Spiral-fidget.jpg',
      stock: 10
    },
    {
      key: 'spiral-cone',
      name: 'Spiral Fidget Cone',
      description: 'A mesmerising spiral cone that collapses and expands with a smooth, satisfying click.',
      price_pence: 799,
      image: '/Spiral.png',
      stock: 10
    },
    {
      key: 'giant-spiral-cone',
      name: 'Giant Spiral Fidget Cone',
      description: 'The big brother of the Spiral Cone — more layers, more satisfying, more impressive.',
      price_pence: 1099,
      image: '/Giant-Spiral.png',
      stock: 10
    },
    {
      key: 'mesh-fidget',
      name: 'Mesh Fidget',
      description: 'A tactile mesh structure that flexes and snaps back — oddly satisfying to squeeze and twist.',
      price_pence: 899,
      image: '/Mesh.png',
      stock: 10
    },
    {
      key: 'infinity-cube',
      name: 'Infinity Cube',
      description: 'The classic infinity cube — folds and flips in every direction. Impossible to put down.',
      price_pence: 999,
      image: '/Infinity.png',
      stock: 10
    },
    {
      key: 'octopus-fidget',
      name: 'Octopus Fidget',
      description: 'Wiggly, flexible tentacles that are weirdly therapeutic. A crowd favourite and great gift.',
      price_pence: 1199,
      image: '/Octopus.jpg',
      stock: 10
    },
    {
      key: 'flex-slug',
      name: 'Flex Slug',
      description: 'A segmented slug that ripples and bends in your hand. Strangely calming to fidget with.',
      price_pence: 899,
      image: '/Slug.png',
      stock: 10
    },
    {
      key: 'spinner-rings',
      name: 'Fidget Spinner Rings',
      description: 'Spin them on your fingers, stack them, fidget with them anywhere. Small, light, addictive.',
      price_pence: 699,
      image: '/Ring.png',
      stock: 10
    },
    {
      key: 'dragon-fidget',
      name: 'Dragon Fidget',
      description: 'A fully articulated dragon that ripples and curls in your hand. Scales, tail and all — printed in one piece.',
      price_pence: 1399,
      image: 'https://makerworld.bblmw.com/makerworld/model/US7c8f2e9e-1e2a-4b3a-8f9e-2226642/cover.jpg',
      stock: 8
    },
    {
      key: 'star-fidget',
      name: 'Star Fidget',
      description: 'A geometric star that satisfyingly morphs and collapses flat. Great desk toy.',
      price_pence: 799,
      image: 'https://makerworld.bblmw.com/makerworld/model/US1755208/cover.jpg',
      stock: 12
    },
    {
      key: 'articulated-shark',
      name: 'Articulated Shark',
      description: 'Every joint flexes — this shark swooshes and wiggles like the real thing. A desk favourite.',
      price_pence: 1099,
      image: 'https://makerworld.bblmw.com/makerworld/model/US463778/cover.jpg',
      stock: 6
    },
    {
      key: 'turtle-fidget',
      name: 'Turtle Fidget',
      description: 'A sweet articulated turtle with a wobbling shell and swaying flippers. Endlessly soothing.',
      price_pence: 999,
      image: 'https://makerworld.bblmw.com/makerworld/model/US2688227/cover.jpg',
      stock: 9
    },
    {
      key: 'button-clicker',
      name: 'Button Clicker',
      description: 'A satisfying mechanical clicker button — push it, hear it snap, repeat forever.',
      price_pence: 599,
      image: 'https://makerworld.bblmw.com/makerworld/model/US2000966/cover.jpg',
      stock: 15
    },
    {
      key: 'switch-fidget',
      name: 'Switch Fidget',
      description: 'Flip it, click it, toggle it. A compact switch fidget that scratches every itch.',
      price_pence: 699,
      image: 'https://makerworld.bblmw.com/makerworld/model/US506311/cover.jpg',
      stock: 11
    },
    {
      key: 'fidget-wobble',
      name: 'Fidget Wobble',
      description: 'Set it down and watch it wobble endlessly. Pick it up and spin it — it never gets old.',
      price_pence: 749,
      image: 'https://makerworld.bblmw.com/makerworld/model/US700410/cover.jpg',
      stock: 7
    }
  ];

  for (const p of products) {
    await pool.query(`
      INSERT INTO products (key, name, description, price_pence, image, stock, in_stock)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      ON CONFLICT (key) DO NOTHING
    `, [p.key, p.name, p.description, p.price_pence, p.image, p.stock]);
  }

  console.log(`Seeded ${products.length} products (skipped any already existing).`);
}

setup().catch(e => { console.error(e); process.exit(1); });