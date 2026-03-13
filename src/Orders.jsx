import React, { useEffect, useMemo, useState } from "react";
import {
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiCalendar,
  FiShoppingBag,
  FiTruck,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

const STATUS_STEPS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loadingTrackId, setLoadingTrackId] = useState(null);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.log("Fetch orders error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchTracking = async (orderId) => {
    const token = localStorage.getItem("token");
    setLoadingTrackId(orderId);

    try {
      const res = await fetch(
        `http://localhost:8000/api/orders/track/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? data.order : order))
        );
        setExpandedOrderId(orderId);
      } else {
        alert(data.message || "Tracking not available yet");
      }
    } catch (error) {
      console.log("Track order error:", error);
      alert("Something went wrong while fetching tracking");
    } finally {
      setLoadingTrackId(null);
    }
  };

  const summary = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) =>
        ["Pending", "Confirmed", "Shipped", "Out for Delivery"].includes(
          o.orderStatus
        )
      ).length,
      delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
      totalSpent: orders.reduce((sum, o) => sum + Number(o.total || 0), 0),
    };
  }, [orders]);

  const getStatusStyle = (status) => {
    const styles = {
      Pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
      Confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      Shipped: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
      "Out for Delivery":
        "bg-purple-500/15 text-purple-400 border-purple-500/20",
      Delivered: "bg-green-500/15 text-green-400 border-green-500/20",
      Cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
    };

    return styles[status] || "bg-gray-500/15 text-gray-300 border-white/10";
  };

  const getStepIndex = (status) => {
    const index = STATUS_STEPS.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const getProgressWidth = (status) => {
    if (status === "Cancelled") return "0%";
    const currentIndex = getStepIndex(status);
    return `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%`;
  };

  const getStatusMessage = (order) => {
    if (order.orderStatus === "Pending") {
      return "Your order has been placed and is waiting for confirmation.";
    }

    if (order.orderStatus === "Confirmed") {
      return "Your order is confirmed and will be prepared for shipment soon.";
    }

    if (order.orderStatus === "Shipped") {
      return order.trackingId
        ? "Your package has been shipped. Courier tracking may take some time to show new scans."
        : "Shipment is being prepared. Tracking will appear once AWB is assigned.";
    }

    if (order.orderStatus === "Out for Delivery") {
      return "Your package is out for delivery and should arrive soon.";
    }

    if (order.orderStatus === "Delivered") {
      return "Your order has been delivered successfully.";
    }

    if (order.orderStatus === "Cancelled") {
      return "This order has been cancelled.";
    }

    return "Your order is being processed.";
  };

  const getLastTrackingUpdate = (order) => {
    if (!order.trackingHistory || order.trackingHistory.length === 0) return null;

    const latestEntry = order.trackingHistory[0];
    return latestEntry?.time ? new Date(latestEntry.time).toLocaleString() : null;
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white pb-10">
      <div className="absolute top-24 left-0 w-72 h-72 bg-orange-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-500/10 blur-3xl rounded-full" />

      <div className="relative max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FiShoppingBag size={22} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              My Orders
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Track and manage all your purchases
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4">
            <p className="text-sm text-gray-400">Total Orders</p>
            <h2 className="text-2xl font-bold mt-1">{summary.total}</h2>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4">
            <p className="text-sm text-gray-400">Active Orders</p>
            <h2 className="text-2xl font-bold text-yellow-400 mt-1">
              {summary.pending}
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4">
            <p className="text-sm text-gray-400">Delivered</p>
            <h2 className="text-2xl font-bold text-green-400 mt-1">
              {summary.delivered}
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4">
            <p className="text-sm text-gray-400">Total Spent</p>
            <h2 className="text-2xl font-bold text-orange-400 mt-1">
              ₹{summary.totalSpent}
            </h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <FiPackage className="text-2xl text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-400">
              Once you place an order, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              const currentStepIndex = getStepIndex(order.orderStatus);
              const lastTrackingUpdate = getLastTrackingUpdate(order);

              return (
                <div
                  key={order._id}
                  className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 hover:border-orange-500/20 hover:shadow-xl hover:shadow-orange-500/5 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                    <div>
                      <p className="text-lg font-bold text-white">
                        Order #{order._id?.slice(-6)}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-orange-400" />
                          <span>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString()
                              : "Recently placed"}
                          </span>
                        </div>

                        {order.paymentMethod && (
                          <div className="flex items-center gap-2">
                            <FiCreditCard className="text-orange-400" />
                            <span>{order.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm border ${getStatusStyle(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus || "Pending"}
                      </span>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">Order Total</p>
                        <p className="text-xl font-bold text-orange-400">
                          ₹{order.total || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.orderStatus !== "Cancelled" && (
                    <div className="mb-6 bg-black/20 border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm sm:text-base font-semibold text-white">
                          Order Progress
                        </h3>
                        <span className="text-xs text-gray-400">
                          {order.orderStatus || "Pending"}
                        </span>
                      </div>

                      <div className="relative">
                        <div className="absolute top-4 left-0 w-full h-1 bg-white/10 rounded-full" />
                        <div
                          className="absolute top-4 left-0 h-1 bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: getProgressWidth(order.orderStatus) }}
                        />

                        <div className="relative grid grid-cols-5 gap-2">
                          {STATUS_STEPS.map((step, index) => {
                            const active = index <= currentStepIndex;
                            return (
                              <div
                                key={step}
                                className="flex flex-col items-center text-center"
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border z-10 ${
                                    active
                                      ? "bg-orange-500 border-orange-500 text-white"
                                      : "bg-[#111] border-white/10 text-gray-500"
                                  }`}
                                >
                                  {active ? <FiCheckCircle size={14} /> : index + 1}
                                </div>
                                <p
                                  className={`mt-3 text-[10px] sm:text-xs ${
                                    active ? "text-white" : "text-gray-500"
                                  }`}
                                >
                                  {step}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3">
                        <p className="text-sm text-gray-200">
                          {getStatusMessage(order)}
                        </p>
                        {lastTrackingUpdate && (
                          <p className="text-xs text-gray-400 mt-2">
                            Last tracking update: {lastTrackingUpdate}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {(order.courierPartner ||
                    order.trackingId ||
                    order.estimatedDelivery) && (
                    <div className="mb-5 bg-black/20 border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FiTruck className="text-orange-400" />
                        <h3 className="font-semibold text-white">
                          Shipping Details
                        </h3>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400">Courier</p>
                          <p className="text-white font-medium">
                            {order.courierPartner || "Not assigned yet"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400">Tracking ID</p>
                          <p className="text-white font-medium break-all">
                            {order.trackingId || "Not available yet"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400">Estimated Delivery</p>
                          <p className="text-white font-medium">
                            {order.estimatedDelivery
                              ? new Date(
                                  order.estimatedDelivery
                                ).toLocaleDateString()
                              : "Updating soon"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.address && (
                    <div className="mb-5 bg-black/20 border border-white/5 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <FiMapPin className="text-orange-400 mt-1" />
                        <div>
                          <p className="font-semibold text-white">
                            {order.address.fullName}
                          </p>
                          <p className="text-sm text-gray-400 leading-6">
                            {order.address.street}, {order.address.city},{" "}
                            {order.address.state} - {order.address.pincode}
                          </p>
                          {order.address.phone && (
                            <p className="text-sm text-gray-400">
                              Phone: {order.address.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">
                      Ordered Items
                    </h3>

                    <div className="space-y-3">
                      {(order.items || []).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-black/20 border border-white/5 rounded-2xl p-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl"
                          />

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white line-clamp-2">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              ₹{item.price} × {item.quantity}
                            </p>
                            {item.category && (
                              <p className="text-xs text-gray-500 mt-1">
                                {item.category}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-400">Subtotal</p>
                            <p className="font-bold text-white">
                              ₹
                              {Number(item.price || 0) *
                                Number(item.quantity || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 bg-black/20 border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <FiClock className="text-orange-400" />
                        <h3 className="font-semibold text-white">
                          Tracking Timeline
                        </h3>
                      </div>

                      {order.trackingHistory && order.trackingHistory.length > 0 ? (
                        <div className="space-y-4">
                          {order.trackingHistory.map((entry, index) => (
                            <div key={index} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-orange-500 mt-1" />
                                {index !== order.trackingHistory.length - 1 && (
                                  <div className="w-[2px] flex-1 bg-white/10 mt-2" />
                                )}
                              </div>

                              <div className="pb-3">
                                <p className="font-medium text-white">
                                  {entry.status || "Status updated"}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {entry.location || "Location unavailable"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {entry.time
                                    ? new Date(entry.time).toLocaleString()
                                    : "Time unavailable"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                          <p className="text-sm text-gray-300">
                            Tracking updates are not available yet.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Courier scans may take some time to appear after shipment is created.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-white/10 mt-5 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-gray-400">
                      Keep this order ID for support and tracking.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() =>
                          setExpandedOrderId((prev) =>
                            prev === order._id ? null : order._id
                          )
                        }
                        className="border border-white/10 hover:border-orange-500/30 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-medium transition"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>

                      <button
                        onClick={() => fetchTracking(order._id)}
                        disabled={
                          loadingTrackId === order._id || !order.trackingId
                        }
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                          !order.trackingId
                            ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600 text-white"
                        }`}
                      >
                        <FiRefreshCw
                          className={
                            loadingTrackId === order._id ? "animate-spin" : ""
                          }
                        />
                        {loadingTrackId === order._id
                          ? "Tracking..."
                          : "Track Order"}
                      </button>

                      <span className="text-xl font-bold text-orange-400">
                        ₹{order.total || 0}
                      </span>
                    </div>
                  </div>

                  {!order.trackingId && (
                    <div className="mt-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3">
                      <p className="text-xs text-yellow-300">
                        Tracking will appear once shipment is created and AWB is assigned.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;