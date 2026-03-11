import React, { useEffect, useMemo, useState } from "react";

const Checkout = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const cartKey = user ? `cart_${user.id}` : "cart_guest";

  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    street: "",
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    setCartItems(savedCart);
  }, [cartKey]);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  }, [cartItems]);

  const deliveryCharge = cartItems.length > 0 ? 49 : 0;
  const total = subtotal + deliveryCharge;

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (
      !address.fullName ||
      !address.phone ||
      !address.pincode ||
      !address.city ||
      !address.state ||
      !address.street
    ) {
      alert("Please fill all address fields");
      return;
    }

    const token = localStorage.getItem("token");

    const payload = {
      items: cartItems.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
      })),
      address,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod: "COD",
    };

    try {
      const res = await fetch("https://rr-mobiles-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Order placed successfully");
        localStorage.removeItem(cartKey);
        window.location.href = "/home/orders";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log("Place order error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="max-w-7xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={address.fullName}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={address.phone}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={address.pincode}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />

            <input
              type="text"
              name="street"
              placeholder="Street / House No"
              value={address.street}
              onChange={handleChange}
              className="border p-3 rounded-lg sm:col-span-2"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{deliveryCharge}</span>
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;