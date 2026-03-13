import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiSliders,
  FiStar,
} from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { toast } from "react-toastify";

const heroImages = [
  "../hero/1.jpg",
  "../hero/2.jpg",
  "../hero/3.jpg",
  "../hero/4.jpg",
];

const getRandomRating = (id) => {
  const seed = String(id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return (4 + (seed % 11) / 10).toFixed(1);
};

const getRandomReviews = (id) => {
  const seed = String(id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return 100 + (seed % 401);
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favourites, setFavourites] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sortBy, setSortBy] = useState("newest");

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const cartKey = user ? `cart_${user.id}` : "cart_guest";

  const addToCart = (product) => {
    if (product.quantity === 0) {
      return toast.error("This product is out of stock");
    }

    const existingCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const foundItem = existingCart.find((item) => item._id === product._id);

    let updatedCart;

    if (foundItem) {
      if (foundItem.quantity >= product.quantity) {
        return toast.error("No more stock available");
      }

      updatedCart = existingCart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...existingCart, { ...product, quantity: 1 }];
    }

    localStorage.setItem(cartKey, JSON.stringify(updatedCart));

    toast("Product added to cart", {
      icon: <span style={{ color: "#ef8521", fontWeight: "bold" }}>✔</span>,
      style: {
        background: "#ffffff",
        color: "#000000",
        fontWeight: "600",
        borderRadius: "10px",
      },
      progressStyle: {
        background: "#ef8521",
      },
    });
  };

  const toggleFavourite = (product) => {
    let updatedFav;
    const exists = favourites.find((item) => item._id === product._id);

    if (exists) {
      updatedFav = favourites.filter((item) => item._id !== product._id);
    } else {
      updatedFav = [...favourites, product];
    }

    setFavourites(updatedFav);
    localStorage.setItem("favourites", JSON.stringify(updatedFav));
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/products/get");
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.log("Fetch products error:", error);
    }
  };

  const deleteItem = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:8000/api/products/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Delete error:", error);
      toast.error("Error deleting product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const savedFav = JSON.parse(localStorage.getItem("favourites")) || [];
    setFavourites(savedFav);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => {
    const allCategories = products.map((item) => item.category).filter(Boolean);
    return ["All", ...new Set(allCategories)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtered = [...filtered].reverse();
    }

    return filtered;
  }, [products, search, selectedCategory, sortBy]);

  const getBadge = (item, index) => {
    if (Number(item.price) > 50000) return "Premium";
    if (index % 3 === 0) return "Hot";
    if (index % 2 === 0) return "New";
    return "Popular";
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <section className="relative overflow-hidden h-[78vh] min-h-[540px]">
        <div
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {heroImages.map((img, index) => (
            <div key={index} className="min-w-full h-full relative">
              <img src={img} alt="hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/40" />
            </div>
          ))}
        </div>

        <div className="absolute top-10 right-10 w-52 h-52 bg-orange-500/15 blur-3xl rounded-full" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-red-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 h-full flex items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 text-sm text-orange-300 mb-5">
              <FaFire />
              Trending gadgets & accessories
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white">
              Shop Smarter with
              <span className="block text-orange-400">
                Premium Mobile Essentials
              </span>
            </h1>

            <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl">
              Discover mobiles, accessories, smart devices, and top picks from
              RR Mobile Solutions with a premium shopping experience, fast checkout,
              and curated collections.
            </p>

            <div className="mt-8">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-lg shadow-black/20">
                <FiSearch className="text-orange-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search products, gadgets, accessories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-2 text-sm text-gray-200">
                100% Genuine Products
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-2 text-sm text-gray-200">
                Fast Delivery
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-2 text-sm text-gray-200">
                Secure Payments
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {heroImages.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full cursor-pointer transition ${
                currentSlide === index ? "bg-orange-500" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="sticky top-[70px] z-20 backdrop-blur-xl bg-[#090909]/80 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <FiSliders className="text-orange-400" />
              <span className="text-sm font-medium">Refine your collection</span>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition ${
                      selectedCategory === cat
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                        : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 text-gray-200 border border-white/10 rounded-xl px-4 py-2 outline-none"
              >
                <option value="newest" className="text-black">Newest</option>
                <option value="price-low" className="text-black">Price: Low to High</option>
                <option value="price-high" className="text-black">Price: High to Low</option>
                <option value="name" className="text-black">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Our Products
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-gray-300">
              <span className="text-orange-400 font-semibold">{products.length}</span> total items
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-gray-300">
              <span className="text-orange-400 font-semibold">{favourites.length}</span> favourites
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item, index) => (
              <div
                key={item._id}
                className="group bg-gradient-to-b from-white/8 to-white/[0.03] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-500/30 transition duration-300 flex flex-col"
              >
                <div className="relative w-full h-40 sm:h-56 bg-black/20 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/90 text-white shadow-lg">
                      {getBadge(item, index)}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFavourite(item)}
                    className="absolute top-3 right-3 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-black/70 transition"
                  >
                    <FiHeart
                      className={`text-lg ${
                        favourites.find((fav) => fav._id === item._id)
                          ? "text-red-500 fill-red-500"
                          : "text-white"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm sm:text-lg font-semibold text-white line-clamp-1">
                      {item.name}
                    </h3>
                  </div>

                  {item.category && (
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      {item.category}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <FiStar className="fill-yellow-400" />
                      <span>{getRandomRating(item._id)}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({getRandomReviews(item._id)} reviews)
                    </span>
                  </div>

                  <p className="text-orange-400 font-bold text-base sm:text-xl mt-3">
                    ₹{item.price}
                  </p>

                  <p className="text-gray-400 text-xs sm:text-sm mt-2 h-10 overflow-hidden">
                    {item.description}
                  </p>

                  <div className="mt-auto pt-4 flex flex-col gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.quantity === 0}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                        item.quantity === 0
                          ? "bg-gray-500 cursor-not-allowed text-white"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      <FiShoppingBag />
                      {item.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>

                    <p
                      className={`text-sm font-semibold ${
                        item.quantity > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {item.quantity > 0
                        ? item.quantity <= 3
                          ? `Only ${item.quantity} left`
                          : `In Stock: ${item.quantity}`
                        : "Out of Stock"}
                    </p>

                    {user?.role === "admin" && (
                      <button
                        onClick={() => deleteItem(item._id)}
                        className="px-3 py-2.5 rounded-xl border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 md:col-span-3 lg:col-span-4">
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                <h3 className="text-2xl font-semibold text-white">
                  No products found
                </h3>
                <p className="text-gray-400 mt-2">
                  Try another search keyword or choose a different category.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;