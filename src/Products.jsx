import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiHeart } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { toast } from "react-toastify";
const heroImages = [
  "../hero/1.jpg",
  "../hero/2.jpg",
  "../hero/3.jpg",
  "../hero/4.jpg",
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favourites, setFavourites] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const cartKey = user ? `cart_${user.id}` : "cart_guest";

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const foundItem = existingCart.find((item) => item._id === product._id);

    let updatedCart;

    if (foundItem) {
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
      icon: (
        <span style={{ color: "#ef8521", fontWeight: "bold" }}>
          ✔
        </span>
      ),
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
        alert("Product deleted successfully");
        fetchProducts();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log("Delete error:", error);
      alert("Error deleting product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const savedFav = JSON.parse(localStorage.getItem("favourites")) || [];
    setFavourites(savedFav);
  }, []);

  const categories = useMemo(() => {
    const allCategories = products
      .map((item) => item.category)
      .filter(Boolean);

    return ["All", ...new Set(allCategories)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden h-[75vh]">

        {/* SLIDING IMAGES */}
        <div
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {heroImages.map((img, index) => (
            <div key={index} className="min-w-full h-full relative">
              <img
                src={img}
                alt="hero"
                className="w-full h-full object-cover"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/70" />
            </div>
          ))}
        </div>

        {/* CONTENT ABOVE SLIDER */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-2xl">

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 text-sm text-orange-300 mb-5">
              <FaFire />
              Trending gadgets & accessories
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white">
              Explore Premium
              <span className="block text-orange-400">
                Mobile Essentials
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-xl">
              Discover mobiles, accessories, smart devices, and top picks from
              RR Mobile Solutions with a premium shopping experience.
            </p>

            {/* Search */}
            <div className="mt-8">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
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
          </div>
        </div>

        {/* SLIDE DOTS */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {heroImages.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full cursor-pointer ${currentSlide === index
                  ? "bg-orange-500"
                  : "bg-white/40"
                }`}
            />
          ))}
        </div>
      </section>
      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-5">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">
            Browse Categories
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition ${selectedCategory === cat
                    ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Our Products
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <div
                key={item._id}
                className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-500/30 transition duration-300 flex flex-col"
              >
                <div className="relative w-full h-36 sm:h-52 bg-black/20 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  <button
                    onClick={() => toggleFavourite(item)}
                    className="absolute top-3 right-3 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-black/70 transition"
                  >
                    <FiHeart
                      className={`text-lg ${favourites.find((fav) => fav._id === item._id)
                          ? "text-red-500 fill-red-500"
                          : "text-white"
                        }`}
                    />
                  </button>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <h3 className="text-sm sm:text-lg font-semibold text-white line-clamp-1">
                    {item.name}
                  </h3>

                  {item.category && (
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      {item.category}
                    </p>
                  )}

                  <p className="text-orange-400 font-bold text-base sm:text-xl mt-2">
                    ₹{item.price}
                  </p>

                  <p className="text-gray-400 text-xs sm:text-sm mt-2 h-10 overflow-hidden">
                    {item.description}
                  </p>

                  <div className="mt-auto pt-4 flex items-center gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm sm:text-base font-medium transition"
                    >
                      Add to Cart
                    </button>

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
            <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-16">
              <h3 className="text-2xl font-semibold text-white">
                No products found
              </h3>
              <p className="text-gray-400 mt-2">
                Try another search or category.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;