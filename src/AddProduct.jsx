import React, { useState } from "react";

const AddProduct = () => {
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: null,
    quantity: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setProductData((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setProductData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (
      !productData.name ||
      !productData.price ||
      !productData.description ||
      !productData.category ||
      productData.quantity === "" ||
      !productData.image
    ) {
      return alert("Please fill all fields");
    }

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("price", productData.price);
    formData.append("description", productData.description);
    formData.append("category", productData.category);
    formData.append("quantity", productData.quantity);
    formData.append("image", productData.image);

    try {
      const res = await fetch("http://localhost:8000/api/products/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Product added successfully");
        setProductData({
          name: "",
          price: "",
          description: "",
          category: "",
          image: null,
          quantity: "",
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log("Add product error:", error);
      alert("Error adding product");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Add Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={productData.name}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={productData.price}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={productData.description}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={productData.quantity}
          onChange={handleChange}
          min="0"
          className="w-full border p-3 rounded-lg"
        />

        <select
          name="category"
          value={productData.category}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        >
          <option value="">Select Category</option>
          <option value="Mobiles">Mobiles</option>
          <option value="Electronics">Electronics</option>
          <option value="Accessories">Accessories</option>
          <option value="Tablets">Tablets</option>
          <option value="Laptops">Laptops</option>
          <option value="Smartwatches">Smartwatches</option>
          <option value="Headphones">Headphones</option>
          <option value="Chargers">Chargers</option>
          <option value="Screen Guard">Screen Guard</option>
          <option value="Mobile Case">Mobile Case</option>
          <option value="Laptop Skins">Laptop Skins</option>
          <option value="Mobile Skins">Mobile Skins</option>
        </select>

        <input
          type="file"
          name="image"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-orange-500 transition"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;