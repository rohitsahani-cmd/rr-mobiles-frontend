import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiMinus, FiTrash2, FiShoppingBag } from "react-icons/fi";

const Cart = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const cartKey = user ? `cart_${user.id}` : "cart_guest";

  const [cartItems, setCartItems] = useState([]);
  const [recommended, setRecommended] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://rr-mobiles-backend.onrender.com/api/products/get");
      const data = await res.json();

      if (data.success) {
        const shuffled = [...data.products].sort(() => 0.5 - Math.random());
        setRecommended(shuffled.slice(0, 4));
      }
    } catch (error) {
      console.log("Recommended products error:", error);
    }
  };

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    setCartItems(savedCart);
    fetchProducts();
  }, [cartKey]);

  const updateCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
  };

  const increaseQty = (id) => {
    const updatedCart = cartItems.map((item) =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updatedCart);
  };

  const decreaseQty = (id) => {
    const updatedCart = cartItems
      .map((item) =>
        item._id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updatedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    updateCart(updatedCart);
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  }, [cartItems]);

  const deliveryCharge = cartItems.length > 0 ? 49 : 0;
  const total = subtotal + deliveryCharge;

  const addRecommendedToCart = (product) => {
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

    updateCart(updatedCart);
  };
  const handleCheckout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/auth/login");
      return;
    }

    navigate("/home/checkout");
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] pb-10 relative overflow-hidden">
      {/* background glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-500/10 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-6 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FiShoppingBag size={20} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              My Cart
            </h1>
            <p className="text-gray-400 text-sm">
              Review your selected items before checkout
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm p-8 text-center border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400">Add some products to continue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 p-4 flex gap-4 items-center hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl"
                  />

                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                      {item.name}
                    </h2>

                    {item.category && (
                      <p className="text-sm text-gray-400 mt-1">
                        {item.category}
                      </p>
                    )}

                    <p className="text-orange-400 font-bold text-lg mt-2">
                      ₹{item.price}
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => decreaseQty(item._id)}
                        className="w-10 h-10 rounded-xl bg-black text-white border border-white/10 flex items-center justify-center hover:bg-orange-500 transition shadow-sm"
                      >
                        -
                        <FiMinus size={16} />
                      </button>

                      <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-semibold text-white">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQty(item._id)}
                        className="w-10 h-10 rounded-xl bg-black text-white border border-white/10 flex items-center justify-center hover:bg-orange-500 transition shadow-sm"
                      >
                        +
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch">
                    <p className="font-bold text-white text-base sm:text-lg">
                      ₹{Number(item.price) * item.quantity}
                    </p>

                    <button
                      onClick={() => removeItem(item._id)}
                      className="flex items-center gap-1 border border-red-500 px-3 py-1 rounded-lg text-red-400 text-sm font-medium hover:bg-red-500 hover:text-white transition"
                    >
                      <FiTrash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 p-5 h-fit sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">
                Price Details
              </h2>

              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-medium text-white">₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span className="font-medium text-white">₹{deliveryCharge}</span>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">₹{total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                Safe checkout and fast delivery.
              </p>
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">You may also like</h2>
            <p className="text-sm text-gray-400">Top picks from our store</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommended.map((item) => (
              <div
                key={item._id}
                className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 overflow-hidden hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-36 sm:h-44 object-cover"
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

                  <button
                    onClick={() => addRecommendedToCart(item)}
                    className="w-full mt-3 bg-black text-white py-2 rounded-lg text-sm hover:bg-orange-500 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;