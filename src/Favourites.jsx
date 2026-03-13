import React, { useEffect, useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { toast } from "react-toastify";

const Favourites = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const cartKey = user ? `cart_${user.id}` : "cart_guest";

  const [favourites, setFavourites] = useState([]);
  const [recommended, setRecommended] = useState([]);

  const fetchProductsAndSync = async () => {
    try {
      const res = await fetch("https://rr-mobiles-backend-1.onrender.com/api/products/get");
      const data = await res.json();

      if (data.success) {
        const allProducts = data.products || [];

        const inStockProducts = allProducts.filter(
          (product) => Number(product.quantity) > 0
        );

        const savedFav = JSON.parse(localStorage.getItem("favourites")) || [];

        const syncedFavourites = savedFav
          .map((favItem) => {
            const matchedProduct = allProducts.find(
              (product) => product._id === favItem._id
            );

            if (!matchedProduct) return null;
            if (Number(matchedProduct.quantity) <= 0) return null;

            return {
              ...favItem,
              name: matchedProduct.name,
              price: matchedProduct.price,
              image: matchedProduct.image,
              category: matchedProduct.category,
              description: matchedProduct.description,
              quantity: matchedProduct.quantity,
            };
          })
          .filter(Boolean);

        setFavourites(syncedFavourites);
        localStorage.setItem("favourites", JSON.stringify(syncedFavourites));

        const filteredRecommended = inStockProducts.filter(
          (product) =>
            !syncedFavourites.some((fav) => fav._id === product._id)
        );

        const shuffled = [...filteredRecommended].sort(() => 0.5 - Math.random());
        setRecommended(shuffled.slice(0, 4));
      }
    } catch (err) {
      console.log("Error fetching favourites/recommended:", err);
    }
  };

  useEffect(() => {
    fetchProductsAndSync();
  }, []);

  const removeFavourite = (id) => {
    const updated = favourites.filter((item) => item._id !== id);
    setFavourites(updated);
    localStorage.setItem("favourites", JSON.stringify(updated));
    toast.success("Removed from favourites");
  };

  const addToCart = (product) => {
    if (Number(product.quantity) <= 0) {
      return toast.error("This product is out of stock");
    }

    const existingCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const foundItem = existingCart.find((item) => item._id === product._id);

    let updatedCart;

    if (foundItem) {
      if (foundItem.quantity >= Number(product.quantity)) {
        return toast.error("No more stock available");
      }

      updatedCart = existingCart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          ...product,
          quantity: 1,
          availableStock: product.quantity,
        },
      ];
    }

    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    toast.success("Added to cart");
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] relative overflow-hidden pb-16">
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/10 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
            <FiHeart size={20} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              My Favourites
            </h1>
            <p className="text-gray-400 text-sm">Your saved products</p>
          </div>
        </div>

        {favourites.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              No favourites yet ❤️
            </h2>
            <p className="text-gray-400">
              Start adding in-stock products to your favourites.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favourites.map((item) => (
              <div
                key={item._id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10 transition"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />

                <div className="p-4">
                  <h3 className="font-semibold text-white line-clamp-1">
                    {item.name}
                  </h3>

                  {item.category && (
                    <p className="text-xs text-gray-400 mt-1">
                      {item.category}
                    </p>
                  )}

                  <p className="text-orange-400 font-bold mt-2">
                    ₹{item.price}
                  </p>

                  <p className="text-xs text-green-400 mt-1">
                    {item.quantity <= 3
                      ? `Only ${item.quantity} left`
                      : `In Stock: ${item.quantity}`}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl text-sm font-medium transition"
                    >
                      Add to Cart
                    </button>

                    <button
                      onClick={() => removeFavourite(item._id)}
                      className="px-3 py-2 border border-red-500 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">You may also like</h2>
            <p className="text-gray-400 text-sm">Top picks from our store</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommended.length > 0 ? (
              recommended.map((item) => (
                <div
                  key={item._id}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-36 object-cover"
                  />

                  <div className="p-3">
                    <h3 className="font-semibold text-white line-clamp-1">
                      {item.name}
                    </h3>

                    {item.category && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.category}
                      </p>
                    )}

                    <p className="text-orange-400 font-bold mt-1">
                      ₹{item.price}
                    </p>

                    <p className="text-xs text-green-400 mt-1">
                      {item.quantity <= 3
                        ? `Only ${item.quantity} left`
                        : `In Stock: ${item.quantity}`}
                    </p>

                    <button
                      onClick={() => addToCart(item)}
                      className="w-full mt-3 bg-black text-white py-2 rounded-lg text-sm hover:bg-orange-500 transition"
                    >
                      <FiShoppingCart className="inline mr-1" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-8 text-gray-400">
                No in-stock recommendations available right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favourites;