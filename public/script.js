const form = document.getElementById("productForm");
const productList = document.getElementById("productList");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const location = document.getElementById("location").value;
  const phone = document.getElementById("phone").value;

  const product = { name, price, location, phone };

  // Save to local storage
  let products = JSON.parse(localStorage.getItem("products")) || [];
  products.push(product);
  localStorage.setItem("products", JSON.stringify(products));

  displayProducts();
  form.reset();
});

function displayProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  productList.innerHTML = "";

  products.forEach((p, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
            <h4>${p.name}</h4>
            <p>₦${p.price} - ${p.location}</p>
            <p>${p.phone}</p>
            <button onclick="deleteProduct(${index})">Delete</button>
        `;
    productList.appendChild(div);
  });
}

function deleteProduct(index) {
  let products = JSON.parse(localStorage.getItem("products")) || [];
  products.splice(index, 1);
  localStorage.setItem("products", JSON.stringify(products));
  displayProducts();
}

// Load on page start
displayProducts();
