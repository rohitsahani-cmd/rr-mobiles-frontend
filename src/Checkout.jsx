import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "https://rr-mobiles-backend-1.onrender.com";

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
  const [isPaying, setIsPaying] = useState(false);
  const [isCodLoading, setIsCodLoading] = useState(false);

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
  const total = subtotal;

  const handleChange = (e) => {
    setAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateAddress = () => {
    if (!user) {
      alert("Please login first");
      return false;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return false;
    }

    if (
      !address.fullName ||
      !address.phone ||
      !address.pincode ||
      !address.city ||
      !address.state ||
      !address.street
    ) {
      alert("Please fill all address fields");
      return false;
    }

    return true;
  };

  const buildPayload = (paymentMethod, paymentStatus = "Pending", razorpayData = {}) => ({
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
    paymentMethod,
    paymentStatus,
    razorpayOrderId: razorpayData.razorpayOrderId || "",
    razorpayPaymentId: razorpayData.razorpayPaymentId || "",
  });

  const placeFinalOrder = async (payload, token) => {
    const res = await fetch(`${API_BASE_URL}/api/orders/place-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    const payload = buildPayload("COD");

    try {
      setIsCodLoading(true);

      const data = await placeFinalOrder(payload, token);

      if (data.success) {
        alert("Order placed successfully");
        localStorage.removeItem(cartKey);
        window.location.href = "/home/orders";
      } else {
        alert(data.message || "Failed to place order");
      }
    } catch (error) {
      console.log("Place order error:", error);
      alert("Something went wrong");
    } finally {
      setIsCodLoading(false);
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!validateAddress()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!loaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    try {
      setIsPaying(true);

      const orderResponse = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: total,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert(orderData.message || "Order creation failed");
        return;
      }
const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  amount: orderData.order.amount,
  currency: orderData.order.currency,
  name: "RR Mobile Solutions",
  description: "Order Payment",
  order_id: orderData.order.id,

  handler: async function (response) {
    try {
      const verifyResponse = await fetch(
        `${API_BASE_URL}/api/payment/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(response),
        }
      );

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        alert(verifyData.message || "Payment verification failed");
        return;
      }

      const payload = buildPayload("ONLINE", "Paid", {
        razorpayOrderId: orderData.order.id,
        razorpayPaymentId: response.razorpay_payment_id,
      });

      const orderSaveData = await placeFinalOrder(payload, token);

      if (orderSaveData.success) {
        alert("Payment successful and order placed");
        localStorage.removeItem(cartKey);
        window.location.href = "/home/orders";
      } else {
        alert(orderSaveData.message || "Payment succeeded but order save failed");
      }
    } catch (error) {
      console.log("Verify/save order error:", error);
      alert("Payment done but something went wrong while saving order");
    }
  },

  prefill: {
    name: address.fullName,
    contact: address.phone,
    email: user?.email || "test@example.com",
  },

  notes: {
    address: `${address.street}, ${address.city}, ${address.state}, ${address.pincode}`,
  },

  theme: {
    color: "#ef8521",
  },

  modal: {
    ondismiss: function () {
      setIsPaying(false);
    },
  },
};
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.log("Payment error:", error);
      alert("Something went wrong");
    } finally {
      setIsPaying(false);
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
              <span className="text-green-600 font-bold">FREE</span>
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isPaying}
            className={`w-full mt-3 py-3 rounded-xl font-semibold transition ${
              isPaying
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-black hover:bg-gray-900 text-white"
            }`}
          >
            {isPaying ? "Processing..." : "Pay Online"}
          </button>

          <button
            onClick={handlePlaceOrder}
            disabled={isCodLoading}
            className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${
              isCodLoading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {isCodLoading ? "Placing Order..." : "Pay on Delivery (+49)"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;