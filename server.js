 
// FARMLINK — server.js (FINAL)
// Storage: Local JSON file (no MongoDB needed)
// Just run:  node server.js
// Then open: http://localhost:3000
// =============================================

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');

const app      = express();
const DB_FILE  = path.join(__dirname, 'products.json');

// ---- MIDDLEWARE ----
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- HELPERS ----
function readProducts() {
  if (!fs.existsSync(DB_FILE)) return [];
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2));
}

// ---- ROUTES ----

// GET all products
app.get('/products', (req, res) => {
  try {
    const products = readProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read products' });
  }
});

// POST — add a new product
app.post('/products', (req, res) => {
  try {
    const { farmerName, name, category, price, unit, location, phone, description } = req.body;

    if (!farmerName || !name || !price || !location || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const products = readProducts();

    const newProduct = {
      id:          uuidv4(),
      farmerName:  farmerName.trim(),
      name:        name.trim(),
      category:    category || '',
      price:       price.trim(),
      unit:        unit || '',
      location:    location.trim(),
      phone:       phone.trim(),
      description: description || '',
      createdAt:   new Date().toISOString()
    };

    products.unshift(newProduct); // newest first
    writeProducts(products);

    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// DELETE — remove a product by id
app.delete('/products/:id', (req, res) => {
  try {
    const products = readProducts();
    const filtered = products.filter(p => p.id !== req.params.id);

    if (filtered.length === products.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    writeProducts(filtered);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Serve index.html for any unmatched route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---- START ----
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FarmLink running at http://localhost:${PORT}`);
});