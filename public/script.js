let allProducts = [];
let activeCategory = 'all';

// ---- NAVIGATION ----
function showSection(section) {
  document.getElementById('browseSection').style.display  = section === 'browse'  ? 'block' : 'none';
  document.getElementById('sellSection').style.display    = section === 'sell'    ? 'block' : 'none';
  document.getElementById('profileSection').style.display = section === 'profile' ? 'block' : 'none';

  document.querySelectorAll('.nav-btn').forEach((btn, i) => {
    btn.classList.toggle('active', ['browse','sell','profile'][i] === section);
  });

  if (section === 'profile') loadProfileSection();
}

// ---- ADD PRODUCT ----
async function addProduct() {
  const farmerName  = document.getElementById('farmerName').value.trim();
  const name        = document.getElementById('name').value.trim();
  const category    = document.getElementById('category').value;
  const price       = document.getElementById('price').value.trim();
  const unit        = document.getElementById('unit').value.trim();
  const location    = document.getElementById('location').value.trim();
  const phone       = document.getElementById('phone').value.trim();
  const description = document.getElementById('description').value.trim();
  const msg         = document.getElementById('formMsg');

  if (!farmerName || !name || !category || !price || !location || !phone) {
    msg.style.color = '#c0392b';
    msg.textContent = '⚠️ Please fill in all required fields.';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerName, name, category, price, unit, location, phone, description })
    });

    if (!res.ok) throw new Error('Server error');

    msg.style.color = '#2d6a4f';
    msg.textContent = '✅ Product listed successfully!';

    ['farmerName','name','category','price','unit','location','phone','description']
      .forEach(id => { document.getElementById(id).value = ''; });

    await loadProducts();

    setTimeout(() => {
      msg.textContent = '';
      showSection('browse');
    }, 1500);

  } catch (err) {
    msg.style.color = '#c0392b';
    msg.textContent = '❌ Failed to list product. Please try again.';
    console.error(err);
  }
}

// ---- LOAD PRODUCTS ----
async function loadProducts() {
  try {
    const res = await fetch('/products');
    const data = await res.json();
    allProducts = Array.isArray(data) ? data : [];
    renderProducts(allProducts);
  } catch (err) {
    console.error('Failed to load products:', err);
    allProducts = [];
    renderProducts([]);
  }
}

// ---- RENDER PRODUCTS ----
function renderProducts(products) {
  const list  = document.getElementById('productList');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('productCount');

  list.innerHTML = '';

  if (!products || products.length === 0) {
    empty.style.display = 'block';
    count.textContent = '0 products';
    return;
  }

  empty.style.display = 'none';
  count.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

  const emoji = { grains:'🌾', vegetables:'🥬', fruits:'🍊', livestock:'🐄', tubers:'🥔', dairy:'🥛' };

  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';

    const cat      = p.category || '';
    const catLabel = cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'General';
    const icon     = emoji[cat] || '🛒';
    const unitTxt  = p.unit ? ` / ${p.unit}` : '';
    const price    = isNaN(p.price) ? p.price : Number(p.price).toLocaleString();

    div.innerHTML = `
      <span class="product-category-badge">${icon} ${catLabel}</span>
      <h3>${esc(p.name)}</h3>
      <div class="product-price">₦${price}<span>${unitTxt}</span></div>
      <div class="product-meta">
        <span>📍 ${esc(p.location)}</span>
        <span>👨‍🌾 ${esc(p.farmerName || 'Farmer')}</span>
        <span>📞 ${esc(p.phone)}</span>
      </div>
      <div class="card-actions">
        <button class="btn-contact" onclick="openModal(${idx(p)})">View Details</button>
        <button class="btn-delete" onclick="deleteProduct('${p.id}')">🗑️</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// Store products for modal access by index
function idx(p) {
  const i = allProducts.findIndex(x => x.id === p.id);
  return i;
}

// ---- SEARCH & FILTER ----
function filterProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  applyFilters(q, activeCategory);
}

function filterByCategory(cat, el) {
  activeCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  applyFilters(q, cat);
}

function applyFilters(query, category) {
  let filtered = allProducts;
  if (category !== 'all') filtered = filtered.filter(p => p.category === category);
  if (query) filtered = filtered.filter(p =>
    (p.name        || '').toLowerCase().includes(query) ||
    (p.location    || '').toLowerCase().includes(query) ||
    (p.farmerName  || '').toLowerCase().includes(query) ||
    (p.description || '').toLowerCase().includes(query)
  );
  renderProducts(filtered);
}

// ---- DELETE ----
async function deleteProduct(id) {
  if (!confirm('Remove this listing?')) return;
  try {
    const res = await fetch(`/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    await loadProducts();
  } catch {
    alert('Failed to delete. Please try again.');
  }
}

// ---- MODAL ----
function openModal(index) {
  const p = allProducts[index];
  if (!p) return;

  const unitTxt = p.unit ? ` / ${p.unit}` : '';
  const price   = isNaN(p.price) ? p.price : Number(p.price).toLocaleString();
  const desc    = p.description
    ? `<p style="margin:12px 0;color:#555;line-height:1.6">${esc(p.description)}</p>` : '';

  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-product-name">${esc(p.name)}</h2>
    <div class="modal-price">₦${price}<span style="font-size:1rem;font-weight:400;color:#888">${unitTxt}</span></div>
    <div class="modal-details">
      ${desc}
      <p>📍 <strong>Location:</strong> ${esc(p.location)}</p>
      <p>👨‍🌾 <strong>Farmer:</strong> ${esc(p.farmerName || 'N/A')}</p>
      <p>📞 <strong>Phone:</strong> ${esc(p.phone)}</p>
    </div>
    <a href="tel:${esc(p.phone)}" class="modal-call-btn">📞 Call Farmer Now</a>
  `;
  document.getElementById('productModal').style.display = 'flex';
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('productModal')) {
    document.getElementById('productModal').style.display = 'none';
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ---- PROFILE ----
function loadProfileSection() {
  const myList = document.getElementById('myProductList');
  const noMsg  = document.getElementById('noListings');
  myList.innerHTML = '';

  if (!allProducts || allProducts.length === 0) {
    noMsg.style.display = 'block';
    return;
  }

  noMsg.style.display = 'none';
  const emoji = { grains:'🌾', vegetables:'🥬', fruits:'🍊', livestock:'🐄', tubers:'🥔', dairy:'🥛' };

  allProducts.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';
    const price = isNaN(p.price) ? p.price : Number(p.price).toLocaleString();
    const icon  = emoji[p.category] || '🛒';
    div.innerHTML = `
      <span class="product-category-badge">${icon} ${esc(p.category || 'General')}</span>
      <h3>${esc(p.name)}</h3>
      <div class="product-price">₦${price}</div>
      <div class="product-meta">
        <span>📍 ${esc(p.location)}</span>
        <span>👨‍🌾 ${esc(p.farmerName || 'Farmer')}</span>
      </div>
      <div class="card-actions">
        <button class="btn-delete" style="width:100%" onclick="deleteProduct('${p.id}')">🗑️ Remove Listing</button>
      </div>
    `;
    myList.appendChild(div);
  });
}

// ---- UTILITY ----
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ---- INIT ----
loadProducts();