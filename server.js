const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let products = [];

// ADD PRODUCT
app.post("/add-product", (req, res) => {
    const product = req.body;
    products.push(product);
    res.json({ message: "Product added successfully" });
});

// GET PRODUCTS
app.get("/products", (req, res) => {
    res.json(products);
});

// DELETE PRODUCT
app.delete("/delete-product/:index", (req, res) => {
    const index = req.params.index;
    products.splice(index, 1);
    res.json({ message: "Product deleted" });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});