import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:8000/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          const foundOrder = data.orders.find((item) => item._id === id);
          setOrder(foundOrder);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrder();
  }, [id]);

  const getStep = (status) => {
    const steps = {
      Confirmed: 1,
      Shipped: 2,
      "Out for Delivery": 3,
      Delivered: 4,
    };
    return steps[status] || 1;
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center">
        Loading order...
      </div>
    );
  }

  const currentStep = getStep(order.orderStatus);

  return (
    <div className="min-h-screen bg-[#090909] text-white pb-10">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <button
          onClick={() => navigate("/home/orders")}
          className="flex items-center gap-2 text-orange-400 mb-6"
        >
          <FiArrowLeft />
          Back to Orders
        </button>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Track Your Order</h1>
            <p className="text-gray-400 mt-2">
              Order ID: #{order._id.slice(-8)}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-10">
            {["Confirmed", "Shipped", "Out for Delivery", "Delivered"].map(
              (step, index) => (
                <div key={step} className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center border-2 ${
                      currentStep >= index + 1
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "border-white/20 text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`mt-3 text-sm ${
                      currentStep >= index + 1
                        ? "text-white"
                        : "text-gray-400"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              )
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/20 border border-white/10 rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiPackage className="text-orange-400" />
                Order Details
              </h2>

              <p className="text-gray-300 mb-2">
                <span className="text-gray-400">Status:</span>{" "}
                {order.orderStatus}
              </p>

              <p className="text-gray-300 mb-2">
                <span className="text-gray-400">Payment:</span>{" "}
                {order.paymentMethod}
              </p>

              <p className="text-gray-300 mb-2">
                <span className="text-gray-400">Total:</span> ₹{order.total}
              </p>

              {order.createdAt && (
                <p className="text-gray-300 mb-2 flex items-center gap-2">
                  <FiCalendar className="text-orange-400" />
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-black/20 border border-white/10 rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiTruck className="text-orange-400" />
                Tracking Details
              </h2>

              <p className="text-gray-300 mb-2">
                <span className="text-gray-400">Courier:</span>{" "}
                {order.courierPartner || "Will be assigned soon"}
              </p>

              <p className="text-gray-300 mb-2">
                <span className="text-gray-400">Tracking ID:</span>{" "}
                {order.trackingId || "Not generated yet"}
              </p>

              <p className="text-gray-300">
                <span className="text-gray-400">Estimated Delivery:</span>{" "}
                {order.estimatedDelivery
                  ? new Date(order.estimatedDelivery).toLocaleDateString()
                  : "Will be updated soon"}
              </p>
            </div>
          </div>

          {order.address && (
            <div className="mt-6 bg-black/20 border border-white/10 rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiMapPin className="text-orange-400" />
                Delivery Address
              </h2>
              <p className="text-gray-300">{order.address.fullName}</p>
              <p className="text-gray-400">
                {order.address.street}, {order.address.city},{" "}
                {order.address.state} - {order.address.pincode}
              </p>
              {order.address.phone && (
                <p className="text-gray-400 mt-1">
                  Phone: {order.address.phone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;