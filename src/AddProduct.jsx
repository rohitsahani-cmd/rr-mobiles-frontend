import React, { useState } from "react";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setProduct({ ...product, image: files[0] });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("description", product.description);
    formData.append("category", product.category);
    formData.append("image", product.image);
   
    

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
        setProduct({
          name: "",
          price: "",
          description: "",
          category: "",
          image: null,
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
          value={product.name}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <select
          name="category"
          value={product.category}
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
          className="w-full bg-black text-white py-3 rounded-lg"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;