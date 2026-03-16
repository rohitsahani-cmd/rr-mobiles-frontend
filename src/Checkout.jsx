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
  const [orderStatus, setOrderStatus] = useState("idle");
  const [failureMessage, setFailureMessage] = useState("");

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    setCartItems(savedCart);
  }, [cartKey]);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
  }, [cartItems]);

  const onlineDeliveryCharge = 0;
  const codDeliveryCharge = cartItems.length > 0 ? 49 : 0;

  const onlineTotal = subtotal + onlineDeliveryCharge;
  const codTotal = subtotal + codDeliveryCharge;

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

  const buildPayload = (
    paymentMethod,
    paymentStatus = "Pending",
    razorpayData = {},
    customDeliveryCharge = 0,
    customTotal = subtotal
  ) => ({
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
    deliveryCharge: customDeliveryCharge,
    total: customTotal,
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

  const showSuccessAndRedirect = () => {
    setOrderStatus("loading");

    setTimeout(() => {
      setOrderStatus("success");
      localStorage.removeItem(cartKey);

      setTimeout(() => {
        window.location.href = "/home/orders";
      }, 2000);
    }, 1500);
  };

  const showFailure = (message = "Payment failed. Please try again.") => {
    setFailureMessage(message);
    setOrderStatus("failed");
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    const payload = buildPayload(
      "COD",
      "Pending",
      {},
      codDeliveryCharge,
      codTotal
    );

    try {
      setIsCodLoading(true);

      const data = await placeFinalOrder(payload, token);

      if (data.success) {
        showSuccessAndRedirect();
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

    const loaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!loaded) {
      showFailure("Razorpay SDK failed to load. Please try again.");
      return;
    }

    try {
      setIsPaying(true);
      setFailureMessage("");
      setOrderStatus("idle");

      const orderResponse = await fetch(
        `${API_BASE_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: onlineTotal,
          }),
        }
      );

      const orderData = await orderResponse.json();

      console.log("ONLINE TOTAL:", onlineTotal);
      console.log("ORDER DATA:", orderData);
      console.log("RAZORPAY KEY:", "rzp_test_SQD3b5534PanLJ");

      if (!orderData.success || !orderData.order?.id) {
        setIsPaying(false);
        showFailure(orderData.message || "Order creation failed");
        return;
      }

      const options = {
        key: "rzp_test_SRpbvKT0eaCgp2",
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "RR Mobile Solutions",
        description: "Order Payment",
        order_id: orderData.order.id,

        handler: async function (response) {
          try {
            setOrderStatus("loading");

            const verifyResponse = await fetch(
              `${API_BASE_URL}/api/payment/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();
            console.log("VERIFY DATA:", verifyData);

            if (!verifyData.success) {
              setIsPaying(false);
              showFailure(verifyData.message || "Payment verification failed");
              return;
            }

            const payload = buildPayload(
              "ONLINE",
              "Paid",
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              },
              onlineDeliveryCharge,
              onlineTotal
            );

            const orderSaveData = await placeFinalOrder(payload, token);
            console.log("ORDER SAVE DATA:", orderSaveData);

            if (orderSaveData.success) {
              setIsPaying(false);
              showSuccessAndRedirect();
            } else {
              setIsPaying(false);
              showFailure(
                orderSaveData.message ||
                  "Payment succeeded but order save failed"
              );
            }
          } catch (error) {
            console.log("Verify/save order error:", error);
            setIsPaying(false);
            showFailure(
              "Payment was completed, but something went wrong while saving the order."
            );
          }
        },
        //Rohith Sahani created..

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
            if (orderStatus === "idle") {
              showFailure("Payment was cancelled by the user.");
            }
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        console.log("FULL RAZORPAY FAILURE:", response);
        console.log("ERROR OBJECT:", response?.error);

        const reason =
          response?.error?.description ||
          response?.error?.reason ||
          response?.error?.code ||
          "Payment failed. Please try again.";

        setIsPaying(false);
        showFailure(reason);
      });

      paymentObject.open();
    } catch (error) {
      console.log("Payment error:", error);
      setIsPaying(false);
      showFailure("Something went wrong while initiating payment.");
    }
  };

  if (orderStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">
            Processing your order...
          </p>
        </div>
      </div>
    );
  }

  if (orderStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            Order Placed Successfully!
          </h2>

          <p className="text-gray-500 text-sm">
            Redirecting to your orders...
          </p>
        </div>
      </div>
    );
  }

  if (orderStatus === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="flex flex-col items-center gap-5 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">Payment Failed</h2>

          <p className="text-sm text-gray-500">
            {failureMessage || "Your payment could not be completed."}
          </p>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => {
                setOrderStatus("idle");
                setFailureMessage("");
              }}
              className="px-5 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition"
            >
              Try Again
            </button>

            <button
              onClick={() => {
                window.location.href = "/home/cart";
              }}
              className="px-5 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <span>Online Delivery</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>

            <div className="flex justify-between">
              <span>COD Charges</span>
              <span>₹{codDeliveryCharge}</span>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Online Total</span>
                <span>₹{onlineTotal}</span>
              </div>

              <div className="flex justify-between font-semibold">
                <span>COD Total</span>
                <span>₹{codTotal}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isPaying}
            className={`w-full mt-4 py-3 rounded-xl font-semibold transition ${
              isPaying
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-black hover:bg-gray-900 text-white"
            }`}
          >
            {isPaying ? "Processing..." : `Pay Online ₹${onlineTotal}`}
          </button>

          <button
            onClick={handlePlaceOrder}
            disabled={isCodLoading}
            className={`w-full mt-4 py-3 rounded-xl font-semibold transition ${
              isCodLoading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {isCodLoading ? "Placing Order..." : `Pay on Delivery ₹${codTotal}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;