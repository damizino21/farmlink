const form = document.getElementById("productForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const product = {
        name: document.getElementById("name").value,
        price: document.getElementBntById("location").value,
        phone: document.getElementById("phone").value
    };

    fetch("/add-product", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
    })
    .then(res => res.json())
    .then(() => {
        form.reset();
        loadProducts();
    });
});

function loadProducts() {
    fetch("/products")
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("productList");
        list.innerHTML = "";

        data.forEach((product, index) => {
            const div = document.createElement("div");
            div.classList.add("product");

            div.innerHTML = `
                <strong>${product.name}</strong><br>
                ₦${product.price} - ${product.location}<br>
                📞 ${product.phone}
                <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
            `;

            list.appendChild(div);
        });
    });
}


function deleteProduct(index) {
    fetch(`/delete-product/${index}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        alert("Product deleted!");
        loadProducts();
    });
}